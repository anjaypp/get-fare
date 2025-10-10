<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use App\Models\Airline;

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

    public function debugToken(){
        return $this->fetchToken();
    }

 // Example: inside searchFlights
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
        'CabinPreferenceType' => ($data['cabinClass'] !== "Economy" && $data['cabinClass'] !== "All") ? 'Restricted' : 'Preferred',
        'stopOver' => 'None',
        'includecarrier' => '',
        'airTravelType' => match ($data['journeyType']) {
            1 => 'Oneway',
            2 => 'RoundTrip',
            default => 'Oneway'
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
        $airlines = Airline::whereIn('Iata_code', $airlineCodes)->get();
        $airlineMap = $airlines->pluck('Airline_name', 'Iata_code');

        foreach ($flights as &$flight) {
            $flight['airlineName'] = $airlineMap[$flight['airline']] ?? $flight['airline'];

            $isDirect = true;
            foreach ($flight['segGroups'] as $segGroup) {
                if (count($segGroup['segs']) > 1) {
                    $isDirect = false;
                    break;
                }
            }
            $flight['isDirect'] = $isDirect;
        }

        $results['flights'] = $flights;
    }

    return $results;
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

        // Log::info('Flights Revalidation API call', [
        //     'endpoint' => $this->baseUrl . 'Flights/Revalidation/v1',
        //     'payload'  => json_encode($payload, JSON_PRETTY_PRINT),
        //     'status'   => $response->status(),
        //     'response' => json_encode($response->json(), JSON_PRETTY_PRINT),
        // ]);

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

}

