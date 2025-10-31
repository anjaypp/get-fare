<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Airline;
use App\Models\Airport;
use App\Models\Booking;

class GetFaresApi
{
    protected $baseUrl;
    protected $clientId;
    protected $clientSecret;
    protected $scope;
    protected $grantType;

    public function __construct()
    {
        $this->baseUrl = config('services.getfares.base_url');
        $this->clientId = config('services.getfares.client_id');
        $this->clientSecret = config('services.getfares.client_secret');
        $this->scope = config('services.getfares.scope');
        $this->grantType = config('services.getfares.grant_type');
    }

    // Get token from cache or fetch new one
    protected function getToken()
    {
        return Cache::remember('getfares_token', 3600, function () {
            return $this->fetchToken();
        });
    }

    // Fetch new token from API
    protected function fetchToken()
    {
        $response = Http::asForm()->post($this->baseUrl.'connect/token', [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'scope' => $this->scope,
            'grant_type' => $this->grantType,
        ]);

        if (!$response->ok()) {
            throw new \Exception($response->body(), $response->status());
        }

        $data = $response->json();
        $token = $data['access_token'];
        $expiresIn = $data['expires_in'] ?? 3600;

        Cache::put('getfares_token', $token, $expiresIn - 60);

        return $token;
    }

public function searchFlights(array $data)
{
    $token = $this->getToken();

    $originDestinations = array_map(function ($leg) {
        return [
            'departureDateTime' => $leg['departureDateTime'],
            'origin' => $leg['origin'],
            'destination' => $leg['destination']
        ];
    }, $data['originDestinations']);

    $payload = [
        'originDestinations' => $originDestinations,
        'adultCount' => $data['adultCount'],
        'childCount' => $data['childCount'],
        'infantCount' => $data['infantCount'],
        'cabinClass' => $data['cabinClass'],
        'cabinPreferenceType' => ($data['cabinClass'] !== "Economy" && $data['cabinClass'] !== "All") ? 'Restricted' : 'Preferred',
        'stopOver' => 'None',
        'includecarrier' => '',
        'airTravelType' => match ($data['journeyType']) {
            1 => 'OneWay',
            2 => 'RoundTrip',
            default => 'OneWay'
        },
        'includeBaggage' => true,
        'IsBrandFareEnable' => false,
        'nationality' => '',
        'includeMiniRules' => true,
        'directOnly' => $data['directOnly']
    ];

    Storage::put('request/search_payload.json', json_encode($payload, JSON_PRETTY_PRINT));

    $response = Http::withToken($token)->post($this->baseUrl . 'Flights/Search/v1', $payload);

    if (!$response->ok()) {
        throw new \Exception($response->body(), $response->status());
    }

    $results = $response->json();
    Storage::put('response/search_results.json', json_encode($results, JSON_PRETTY_PRINT));


    if (!empty($results['flights'])) {
        $flights = $results['flights'];

        $airlineCodes = collect($flights)->pluck('airline')->unique();
        $allCodes = collect($flights)
        ->flatMap(fn($f) =>
        collect($f['segGroups'])
            ->flatMap(fn($sg) =>
                collect($sg['segs'])
                    ->flatMap(fn($s) => [$s['origin'], $s['destination']])
            )
        )
        ->unique()
        ->values()
        ->toArray();

        $airlines = Airline::whereIn('Iata_code', $airlineCodes)->get();
        $airlineMap = $airlines->pluck('Airline_name', 'Iata_code');
        $airportMap = Airport::whereIn('iata_code', $allCodes)->pluck('city_name', 'iata_code');

        $filteredFlights = [];

        foreach ($flights as &$flight) {
            $flight['airlineName'] = $airlineMap[$flight['airline']] ?? $flight['airline'] ?? 'Unknown Airline';

        foreach ($flight['segGroups'] as &$segGroup) {
                 $segGroup['originCity'] = $airportMap[$segGroup['origin']] ?? $segGroup['origin'];
                $segGroup['destinationCity'] = $airportMap[$segGroup['destination']] ?? $segGroup['destination'];

        foreach ($segGroup['segs'] as &$seg) {
            $seg['originCity'] = $airportMap[$seg['origin']] ?? $seg['origin'];
            $seg['destinationCity'] = $airportMap[$seg['destination']] ?? $seg['destination'];
        }
    }

            // Filter fareGroups with seats only
            $flight['fareGroups'] = array_values(array_filter($flight['fareGroups'] ?? [], function ($fareGroup) {
                foreach ($fareGroup['segInfos'] ?? [] as $seg) {
                    if (!empty($seg['seatRemaining']) && $seg['seatRemaining'] > 0) {
                        return true;
                    }
                }
                return false;
            }));

            // Keep flight only if at least one fareGroup has seats
            if (!empty($flight['fareGroups'])) {
                $filteredFlights[] = $flight;
            }
        }
        unset($flight);

        $results['flights'] = array_values($filteredFlights);

        // Add metadata to filtered flights only
        foreach ($results['flights'] as &$flight) {
            $minPrice = PHP_INT_MAX;
            foreach ($flight['fareGroups'] ?? [] as $fareGroup) {
                $total = 0;
                foreach ($fareGroup['fares'] ?? [] as $fare) {
                    $taxTotal = array_sum(array_column($fare['taxes'] ?? [], 'amt'));
                    $total += ($fare['base'] ?? 0 + $taxTotal);
                }
                $minPrice = min($minPrice, $total);
            }
            $flight['minPrice'] = ($minPrice === PHP_INT_MAX) ? 0 : $minPrice;

            // totalDuration
            $totalDuration = 0;
            foreach ($flight['segGroups'] ?? [] as $segGroup) {
                foreach ($segGroup['segs'] ?? [] as $seg) {
                    $totalDuration += $seg['duration'] ?? 0;
                }
            }
            $flight['totalDuration'] = $totalDuration;

            // departTime (outbound)
            $flight['departTime'] = $flight['segGroups'][0]['segs'][0]['departureOn'] ?? null;

            // arrivalTime (outbound arrival; use for 'Arrive')
            $firstGroup = $flight['segGroups'][0] ?? [];
            $outboundSegs = $firstGroup['segs'] ?? [];
            $lastOutboundSeg = end($outboundSegs);
            $flight['arrivalTime'] = $lastOutboundSeg['arrivalOn'] ?? null;

            // returnDepartTime (return for round-trip; fallback to arrivalTime for one-way)
            if (!empty($flight['segGroups'][1]['segs'])) {
                $firstReturnSeg = reset($flight['segGroups'][1]['segs']);
                $flight['returnDepartTime'] = $firstReturnSeg['departureOn'] ?? null;
            } else {
                $flight['returnDepartTime'] = $flight['arrivalTime'] ?? null;
            }

            // totalStops
            $stops = 0;
            foreach ($flight['segGroups'] ?? [] as $segGroup) {
                $segGroupSegs = $segGroup['segs'] ?? [];
                $stops += (count($segGroupSegs) - 1);
            }
            $flight['totalStops'] = $stops;
        }
        unset($flight);

        // Cache only filtered flights with seats
        $traceId = $results['traceId'] ?? Str::uuid()->toString();
        Cache::put("flights:{$traceId}", $results['flights'], now()->addMinutes(15));
        $results['traceId'] = $traceId;
        $results['totalFlights'] = count($results['flights']);

        // Default sort on filtered results
        $results['flights'] = $this->sortFlights($traceId, 'minPrice', 'asc')['flights'];

        $page = max(1, (int) ($data['page'] ?? 1));
        $limit = max(1, (int) ($data['limit'] ?? 10));

        //Paginate flight if they exist
        if(!empty($results['flights'])){
            $totalFlights = count($results['flights']);
            $totalPages = ceil($totalFlights / $limit);
            if ($page > $totalPages) {
                $page = $totalPages > 0 ? $totalPages : 1;
            }
            $offset = ($page - 1) * $limit;
            $paginatedFlights = array_slice($results['flights'], $offset, $limit);

            $results['pagination'] = [
                'total' => $totalFlights,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => ceil($totalFlights / $limit)
            ];

            $results['flights'] = $paginatedFlights;
        }
        } else {
        // No raw flights from API - return empty structure
        $traceId = $results['traceId'] ?? Str::uuid()->toString();
        $results['flights'] = [];
        $results['traceId'] = $traceId;
        $results['totalFlights'] = 0;
        Cache::put("flights:{$traceId}", [], now()->addMinutes(15));

        $results['pagination'] = [
            'total' => 0,
            'page' => 1,
            'limit' => 10,
            'totalPages' => 0
        ];
    }

    return $results;
}

public function sortFlights(string $traceId, string $sortBy, string $order = 'asc'): array
{
    $flights = Cache::get("flights:{$traceId}", []);

    if (empty($flights)) {
        return [
            'flights' => [],
            'traceId' => $traceId,
            'totalFlights' => 0,
        ];
    }

    usort($flights, function ($a, $b) use ($sortBy, $order) {
        // Get values
        $valA = $a[$sortBy] ?? null;
        $valB = $b[$sortBy] ?? null;

        // Handle nulls: push to end in asc, start in desc
        if ($valA === null && $valB === null) return 0;
        if ($valA === null) return $order === 'asc' ? 1 : -1;
        if ($valB === null) return $order === 'asc' ? -1 : 1;

        // Convert to comparable (timestamp for times, numeric for others)
        $cmpA = $this->getComparableValue($valA, $sortBy);
        $cmpB = $this->getComparableValue($valB, $sortBy);

        if ($cmpA === $cmpB) return 0;

        // Compare
        $result = $cmpA < $cmpB ? -1 : 1;

        // Reverse for desc
        if ($order === 'desc') {
            $result = -$result;
        }

        return $result;
    });

    return [
        'flights' => $flights,
        'traceId' => $traceId,
        'totalFlights' => count($flights),
    ];
}

private function getComparableValue($value, $sortBy): int|float
{
    if (in_array($sortBy, ['departTime', 'arrivalTime', 'returnDepartTime'])) {
        return strtotime($value) ?: 0;  // Timestamp or 0 for invalid
    }

    // Numeric for price, duration, stops
    return (float) $value;
}

public function revalidate(array $data)
{
    $token = $this->getToken();

    $payload = [
        'traceId' => $data['traceId'],
        'purchaseIds' => array_map('strval', $data['purchaseIds']),
    ];

    Storage::put('request/revalidate_payload.json', json_encode($payload, JSON_PRETTY_PRINT));

    $cacheKey = 'revalidate_' . md5($payload['traceId'] . implode(',', $payload['purchaseIds']));

    return Cache::remember($cacheKey, now()->addMinutes(2), function () use ($token, $payload) {

        $response = Http::withToken($token)
            ->retry(2, 200)
            ->timeout(25)
            ->post($this->baseUrl . 'Flights/Revalidation/v1', $payload);


        if($response->status() == 204){
            Storage::put('response/revalidate_response.json', json_encode($response->json(), JSON_PRETTY_PRINT));
        }
        if (!$response->ok()) {
            $errorBody = $response->json();
            $errorMessage = $errorBody['message'] ?? $response->body();
            Log::error('Flights Revalidation API failed', [
                'status' => $response->status(),
                'error'  => $errorBody,
            ]);
            throw new \Exception('Failed to revalidate fares: ' . $errorMessage, $response->status());
        }

        Storage::put('response/revalidate_response.json', json_encode($response->json(), JSON_PRETTY_PRINT));

        return $response->json();
    });
}


    public function createPnr(array $data)
{
    $token = $this->getToken();
    $url   = $this->baseUrl . "Flights/Booking/CreatePNR/v1";

    $passengers = array_map(function ($pax) {
    $passenger = [
        'title' => $pax['title'],
        'firstName' => $pax['firstName'],
        'lastName' => $pax['lastName'],
        'email' => $pax['email'],
        'dob' => $pax['dob'],
        'genderType' => $pax['genderType'],
        'areaCode' => $pax['areaCode'] ?? '',
        'ffNumber' => $pax['ffNumber'] ?? '',
        'paxType' => $pax['paxType'],
        'mobile' => $pax['mobile'] ?? '',
        'passportNumber' => $pax['passportNumber'],
        'passengerNationality' => $pax['passengerNationality'],
        'passportDOI' => $pax['passportDOI'],
        'passportDOE' => $pax['passportDOE'],
        'passportIssuedCountry' => $pax['passportIssuedCountry'],
        'seatPref' => $pax['seatPref'] ?? '',
        'mealPref' => $pax['mealPref'] ?? '',
        'ktn' => $pax['ktn'] ?? '',
        'redressNo' => $pax['redressNo'] ?? '',
    ];

    // Add serviceReference only for ADT or CHD
    if (in_array($pax['paxType'], ['ADT', 'CHD'])) {
        $passenger['serviceReference'] = [
            ['baggageRefNo' => '', 'MealsRefNo' => '', 'SeatRefNo' => '', 'SegmentInfo' => ''],
            ['baggageRefNo' => '', 'SeatRefNo' => '', 'SegmentInfo' => '']
        ];
    }

    return $passenger;
    }, $data['passengers']);


    $payload = [
        'traceId' => $data['traceId'],
        'gstDetails' => $data['gstDetails'] ?? null,
        'purchaseIds' => array_map('strval', $data['purchaseIds']),
        'isHold' => $data['isHold'],
        'address' => $data['address'] ?? null,
        'passengers' => $passengers,
    ];

    Storage::put('request/pnr_payload.json', json_encode($payload, JSON_PRETTY_PRINT));

    $response = Http::withToken($token)->post($url, $payload);

    if (!$response->ok()) {
        throw new \Exception($response->body(), $response->status());
    }

    $pnrData = $response->json();

    Storage::put('response/pnr_response.json', json_encode($pnrData, JSON_PRETTY_PRINT));

    if (!isset($pnrData['orderId'])) {
        throw new \Exception('PNR creation returned no orderId');
    }

    return [
        'success' => true,
        'data'    => $pnrData,
    ];
}

public function getSeatLayout(array $data){

    $token = $this->getToken();

    $payload = [
        'traceId' => $data['traceId'],
        'purchaseIds' => array_map('strval', $data['purchaseIds']),
    ];

    Storage::put('request/seatlayout_payload.json', json_encode($payload, JSON_PRETTY_PRINT));

    $response = Http::withToken($token)
            ->retry(2, 200)
            ->timeout(25)
            ->post($this->baseUrl . 'Flights/Revalidation/v1/Seatlayout', $payload);

    Storage::put('response/seatlayout_response.json', json_encode($response->json(), JSON_PRETTY_PRINT));

    return $response->json();
}

public function getBooking(string $orderId)
{
    $token = $this->getToken();
    $url   = $this->baseUrl . "Flights/Booking/GetBooking/v1/" . $orderId;

    Storage::put('request/get_booking_payload.json', json_encode($url, JSON_PRETTY_PRINT));

    $response = Http::withToken($token)->get($url);

    Storage::put('response/get_booking_response.json', json_encode($response->json(), JSON_PRETTY_PRINT));


    if (!$response->ok()) {
        throw new \Exception($response->body(), $response->status());
    }

    return [
        'success' => true,
        'data'    => $response->json(),
    ];
}

public function issueTicket(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
        ]);

        $orderId = $request->orderId;
        $token   = $this->getToken();
        $url     = $this->baseUrl . "Flights/Booking/TicketOrder/v1";

        Storage::put('request/get_booking_payload.json', json_encode(['orderId' => $orderId], JSON_PRETTY_PRINT));

        $response = Http::withToken($token)->post($url, ['orderId' => $orderId]);

        Storage::put('response/get_booking_response.json', json_encode($response->json(), JSON_PRETTY_PRINT));

        if (!$response->ok()) {
            return response()->json([
                'success' => false,
                'message' => $response->body()
            ], $response->status());
        }

        return response()->json([
            'success' => true,
            'data'    => $response->json(),
        ]);
    }

    public function cancelTicket(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
        ]);

        $orderId = $request->orderId;
        $token   = $this->getToken();
        $url     = $this->baseUrl . "Flights/Booking/CreatePNR/v1/ReleasePNR";

        Storage::put('request/cancel_booking_payload.json', json_encode(['url' => $url], JSON_PRETTY_PRINT));

        $response = Http::withToken($token)->post($url, ['orderId' => $orderId]);

        Storage::put('response/cancel_booking_response.json', json_encode($response->json(), JSON_PRETTY_PRINT));

        if (!$response->ok()) {
            return response()->json([
                'success' => false,
                'message' => $response->body()
            ], $response->status());
        }

        return response()->json([
            'success' => true,
            'data'    => $response->json(),
        ]);
    }

    public function saveBooking(array $data){
    // Make function idempotent and tolerant of different API key names.
    $orderRefId = $data['orderRefId'] ?? $data['orderId'] ?? $data['order_id'] ?? null;
    if (empty($orderRefId)) {
        Log::warning('saveBooking called without orderRefId/orderId', ['payload_keys' => array_keys($data)]);
        throw new \InvalidArgumentException('Missing orderRefId/orderId in booking data');
    }

    // Avoid duplicate inserts: if booking already exists return it
    $existing = Booking::where('orderRefId', $orderRefId)->first();
    if ($existing) {
        Log::info('Booking already exists, returning existing record', ['orderRefId' => $orderRefId]);
        return $existing;
    }

    DB::beginTransaction();
    try {
        $booking = Booking::create([
            'orderRefId' => $orderRefId,
            'traceId' => $data['traceId'] ?? null,
            'bookingSource' => $data['bookingSource'] ?? null,
            'clientName' => $data['clientName'] ?? null,
            'clientEmail' => $data['clientEmail'] ?? null,
            'endClientEmail' => $data['endClientEmail'] ?? null,
            'endClientName' => $data['endClientName'] ?? null,
            'clientContactNo' => $data['clientContactNo'] ?? null,
            'airTravelType' => $data['airTravelType'] ?? null,
        ]);

        // Loop through Flights
        foreach ($data['flights'] ?? [] as $f) {
            $flight = $booking->flights()->create([
                'purchaseId' => $f['purchaseId'] ?? null,
                'pnr' => $f['pnr'] ?? null,
                'validatingAirline' => $f['validatingAirline'] ?? null,
                'adultCount' => $f['adultCount'] ?? 0,
                'childCount' => $f['childCount'] ?? 0,
                'infantCount' => $f['infantCount'] ?? 0,
                'currency' => $f['currency'] ?? null,
                'currentStatus' => $f['currentStatus'] ?? null,
                'refundable' => $f['refundable'] ?? false,
                'fareType' => $f['fareType'] ?? null,
                'priceClass' => $f['priceClass'] ?? null,
                'fop' => $f['fop'] ?? null,
                'address' => $f['address'] ?? null,
                'gst' => $f['gst'] ?? null,
                'miniRules' => $f['miniRules'] ?? null,
                'flightFares' => $f['flightFares'] ?? null,
                'meals' => $f['meals'] ?? null,
                'seats' => $f['seats'] ?? null,
                'grossFare' => $f['grossFare'] ?? 0,
                'netFare' => $f['netFare'] ?? ($f['netfare'] ?? 0),
                'clientMarkup' => $f['clientMarkup'] ?? 0,
            ]);

            // Passengers
            if (!empty($f['passengers'])) {
                foreach ($f['passengers'] as $pax) {
                    $flight->passengers()->create([
                        'title' => $pax['title'] ?? null,
                        'firstName' => $pax['firstName'] ?? null,
                        'lastName' => $pax['lastName'] ?? null,
                        'email' => $pax['email'] ?? null,
                        'dob' => $pax['dob'] ?? null,
                        'genderType' => $pax['genderType'] ?? null,
                        'paxType' => $pax['paxType'] ?? null,
                        'mobile' => $pax['mobile'] ?? null,
                        'passportNumber' => $pax['passportNumber'] ?? null,
                        'passengerNationality' => $pax['passengerNationality'] ?? null,
                        'passportDOE' => $pax['passportDOE'] ?? null,
                        'passportIssuedCountry' => $pax['passportIssuedCountry'] ?? null,
                        'seatPref' => $pax['seatPref'] ?? null,
                        'mealPref' => $pax['mealPref'] ?? null,
                        'ticketNumber' => $pax['ticketNumber'] ?? null,
                        'flightTicketStatus' => $pax['flightTicketStatus'] ?? null,
                    ]);
                }
            }

            // Segments
            if (!empty($f['segGroups'])) {
                foreach ($f['segGroups'] as $sg) {
                    if (!empty($sg['segments'])) {
                        foreach ($sg['segments'] as $seg) {
                            $flight->segments()->create([
                                'isReturn' => $seg['isReturn'] ?? false,
                                'origin' => $seg['origin'] ?? null,
                                'destination' => $seg['destination'] ?? null,
                                'departureOn' => $seg['departureOn'] ?? null,
                                'arrivalOn' => $seg['arrivalOn'] ?? null,
                                'duration' => $seg['duration'] ?? null,
                                'flightNum' => $seg['flightNum'] ?? null,
                                'eqpType' => $seg['eqpType'] ?? null,
                                'mrkAirline' => $seg['mrkAirline'] ?? null,
                                'depTerminal' => $seg['depTerminal'] ?? null,
                                'arrTerminal' => $seg['arrTerminal'] ?? null,
                                'opAirline' => $seg['opAirline'] ?? null,
                                'rbd' => $seg['rbd'] ?? null,
                                'cabinClass' => $seg['cabinClass'] ?? null,
                                'pnr' => $seg['pnr'] ?? null,
                                'flightTicketStatus' => $seg['flightTicketStatus'] ?? null,
                            ]);
                        }
                    }
                }
            }

            // Baggage
            if (!empty($f['baggages'])) {
                foreach ($f['baggages'] as $b) {
                    $flight->baggages()->create([
                        'paxType' => $b['paxType'] ?? null,
                        'checkInBag' => $b['checkInBag'] ?? null,
                        'cabinBag' => $b['cabinBag'] ?? null,
                        'cityPair' => $b['cityPair'] ?? null,
                        'amount' => $b['amount'] ?? 0,
                        'isPaidBaggage' => $b['isPaidBaggage'] ?? false,
                    ]);
                }
            }
        }

        DB::commit();
        Log::info('Booking saved', ['orderRefId' => $orderRefId, 'booking_id' => $booking->id]);
        return $booking;
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Failed to save booking', ['error' => $e->getMessage(), 'payload' => $data]);
        throw $e;
    }
}

}

