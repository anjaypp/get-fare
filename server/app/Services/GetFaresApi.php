<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
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

  public function searchFlights(array $data)
{
    $startTime = microtime(true);

    // 1️⃣ Token fetch timing
    $tokenStart = microtime(true);
    $token = $this->getToken();
    $tokenDuration = microtime(true) - $tokenStart;
    \Log::info("Time to get token: {$tokenDuration}s");

    // 2️⃣ Payload preparation timing
    $payloadStart = microtime(true);
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
        'CabinPreferenceType' => 'Preferred',
        'stopOver' => 'None',
        'includecarrier' => '',
        'airTravelType' => match ($data['journeyType']) {
            1 => 'Oneway',
            2 => 'RoundTrip',
            default => 'multi'
        },
        'includeBaggage' => true,
        'nationality' => '',
        'includeMiniRules' => false,
        'directOnly' => $data['directOnly']
    ];
    $payloadDuration = microtime(true) - $payloadStart;
    \Log::info("Time to prepare payload: {$payloadDuration}s");

    $cacheKey = 'search_' . md5(json_encode($payload));

    // 3️⃣ Cache / API timing
    $cacheStart = microtime(true);
    $results = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($token, $payload) {
        $apiStart = microtime(true);
        $response = Http::withToken($token)
            ->retry(2, 200)
            ->timeout(25) // increase slightly if API can take long
            ->post($this->baseUrl . 'Flights/Search/v1', $payload);
        $apiDuration = microtime(true) - $apiStart;
        \Log::info("Time for API call: {$apiDuration}s");

        if (!$response->ok()) {
            throw new \Exception($response->body(), $response->status());
        }

        return $response->json();
    });
    $cacheDuration = microtime(true) - $cacheStart;
    \Log::info("Total time including cache lookup: {$cacheDuration}s");

    // 4️⃣ Enrichment timing
    if (!empty($results['flights'])) {
        $enrichStart = microtime(true);
        $flights = $results['flights'];

        $airlineCodes = collect($flights)->pluck('airline')->unique();
        $airlines = Airline::whereIn('Iata_code', $airlineCodes)->get();
        $airlineMap = $airlines->pluck('Airline_name', 'Iata_code');

        foreach ($flights as &$flight) {
            $flight['airlineName'] = $airlineMap[$flight['airline']] ?? $flight['airline'];
            $flight['hasSeats'] = false;

            foreach ($flight['fareGroups'] as $fareGroup) {
                foreach ($fareGroup['segInfos'] as $segInfo) {
                    if ($segInfo['seatRemaining'] > 0) {
                        $flight['hasSeats'] = true;
                        break 2;
                    }
                }
            }
        }

        $results['flights'] = $flights;
        $enrichDuration = microtime(true) - $enrichStart;
        \Log::info("Time to enrich flights: {$enrichDuration}s");
    }

    $totalDuration = microtime(true) - $startTime;
    \Log::info("Total searchFlights duration: {$totalDuration}s");

    return $results;
}

    // Revalidation method
public function revalidate(array $payload)
{
    $startTime = microtime(true);

    $token = $this->getToken();
    $afterToken = microtime(true) - $startTime;
    \Log::info("Time to get token in revalidate: {$afterToken}s");

    // Ensure purchaseIds exists and is an array
    if (!isset($payload['purchaseIds']) || !is_array($payload['purchaseIds']) || empty($payload['purchaseIds'])) {
        \Log::error('Invalid payload: purchaseIds is missing or empty', ['payload' => $payload]);
        throw new \InvalidArgumentException('purchaseIds is required and must be a non-empty array.', 400);
    }

    // Ensure traceId exists
    if (!isset($payload['traceId']) || empty($payload['traceId'])) {
        \Log::error('Invalid payload: traceId is missing', ['payload' => $payload]);
        throw new \InvalidArgumentException('traceId is required.', 400);
    }

    // Create a unique cache key based on traceId + purchaseIds
    $cacheKey = 'revalidate_' . md5($payload['traceId'] . implode(',', $payload['purchaseIds']));

    return Cache::remember($cacheKey, now()->addMinutes(2), function () use ($token, $payload, $startTime) {

        $apiStart = microtime(true);
        try {
            $response = Http::withToken($token)
                ->retry(2, 200)
                ->timeout(15)
                ->post($this->baseUrl . 'Flights/Revalidation/v1', $payload);

            $apiDuration = microtime(true) - $apiStart;
            \Log::info("Time for revalidation API call / cache lookup: {$apiDuration}s");


            if (!$response->ok()) {
                $errorBody = $response->json();
                $errorMessage = $errorBody['message'] ?? $response->body();
                \Log::error('External API error', ['status' => $response->status(), 'error' => $errorBody]);
                throw new \Exception('Failed to revalidate fares: ' . $errorMessage, $response->status());
            }

            $totalDuration = microtime(true) - $startTime;
            \Log::info("Total revalidate duration including token and cache: {$totalDuration}s");

            return $response->json();
        } catch (\Illuminate\Http\Client\RequestException $e) {
            \Log::error('External API request failed', ['error' => $e->getMessage()]);
            throw new \Exception('Failed to connect to the revalidation service: ' . $e->getMessage(), 503);
        }
    });
}


    public function createPnr(array $bookingData)
    {
        $token = $this->getToken();

        $response = Http::withToken($token)
        ->post($this->baseUrl."Flights/Booking/CreatePNR/v1", $bookingData);

        if (!$response->ok()) {
            \Log::error('Booking API failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            throw new \Exception($response->body(), $response->status());
        }

        $pnrData = $response->json();

        if (!isset($pnrData['orderId'])) {
        throw new \Exception('PNR creation returned no orderId');
        }

        return [
            'success' => true,
            'data' => $pnrData,
        ];

    }

    public function getBooking(string $orderId){

        $token = $this->getToken();

        $response = Http::withToken($token)
        ->get($this->baseUrl."Flights/Booking/GetBooking/v1/".$orderId);

        if (!$response->ok()) {
            \Log::error('Booking API failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            throw new \Exception($response->body(), $response->status());
        }

        return [
            'success' => true,
            'data' => $response->json(),
        ];

    }

}

