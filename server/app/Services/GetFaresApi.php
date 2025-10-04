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
        'CabinPreferenceType' => 'Preferred',
        'stopOver' => 'None',
        'includecarrier' => '',
        'airTravelType' => match ($data['journeyType']) {
            1 => 'Oneway',
            2 => 'RoundTrip',
            default => 'multi'
        },
        'includeBaggage' => true,
        'IsBrandFareEnable' => false,
        'nationality' => '',
        'includeMiniRules' => false,
        'directOnly' => $data['directOnly']
    ];

    $cacheKey = 'search_' . md5(json_encode($payload));

    $results = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($token, $payload) {

        $response = Http::withToken($token)
            ->retry(2, 200)
            ->timeout(25)
            ->post($this->baseUrl . 'Flights/Search/v1', $payload);
;


        // 🔹 Log full request & response for debugging
            Log::info('Flights Search API call', [
                'endpoint' => $this->baseUrl . 'Flights/Search/v1',
                'payload'  => json_encode($payload, JSON_PRETTY_PRINT),
                'status'   => $response->status(),
                'response' => json_encode($response->json(), JSON_PRETTY_PRINT)
            ]);

        if (!$response->ok()) {
            throw new \Exception($response->body(), $response->status());
        }

        return $response->json();
    });

     if (!empty($results['flights'])) {
        $enrichStart = microtime(true);
        $flights = $results['flights'];

        $airlineCodes = collect($flights)->pluck('airline')->unique();
        $airlines = Airline::whereIn('Iata_code', $airlineCodes)->get();
        $airlineMap = $airlines->pluck('Airline_name', 'Iata_code');

        foreach ($flights as &$flight) {
            $flight['airlineName'] = $airlineMap[$flight['airline']] ?? $flight['airline'];
            $flight['hasSeats'] = false;

            //Check for direct or connecting
            $isDirect = true;
            foreach ($flight['segGroups'] as $segGroup) {
                if (count($segGroup['segs']) > 1) {
                    $isDirect = false;
                    break;
                }
            }
            $flight['isDirect'] = $isDirect;

            // foreach ($flight['fareGroups'] as $fareGroup) {
            //     foreach ($fareGroup['segInfos'] as $segInfo) {
            //         if ($segInfo['seatRemaining'] > 0) {
            //             $flight['hasSeats'] = true;
            //             break 2;
            //         }
            //     }
            // }
        }

        $results['flights'] = $flights;
    }

    return $results;
}

public function revalidate(array $payload)
{
    $token = $this->getToken();

    $cacheKey = 'revalidate_' . md5($payload['traceId'] . implode(',', $payload['purchaseIds']));

    return Cache::remember($cacheKey, now()->addMinutes(2), function () use ($token, $payload) {

        $response = Http::withToken($token)
            ->retry(2, 200)
            ->timeout(15)
            ->post($this->baseUrl . 'Flights/Revalidation/v1', $payload);

        Log::info('Flights Revalidation API call', [
            'endpoint' => $this->baseUrl . 'Flights/Revalidation/v1',
            'payload'  => json_encode($payload, JSON_PRETTY_PRINT),
            'status'   => $response->status(),
            'response' => json_encode($response->json(), JSON_PRETTY_PRINT),
        ]);

        if (!$response->ok()) {
            $errorBody = $response->json();
            $errorMessage = $errorBody['message'] ?? $response->body();
            Log::error('Flights Revalidation API failed', [
                'status' => $response->status(),
                'error'  => $errorBody,
            ]);
            throw new \Exception('Failed to revalidate fares: ' . $errorMessage, $response->status());
        }

        return $response->json();
    });
}
    public function createPnr(array $bookingData)
{
    $token = $this->getToken();
    $url   = $this->baseUrl . "Flights/Booking/CreatePNR/v1";

    $response = Http::withToken($token)->post($url, $bookingData);

    // Log request and response
    \Log::info('Create PNR API Call', [
        'url'      => $url,
        'request'  => json_encode($bookingData, JSON_PRETTY_PRINT),
        'status'   => $response->status(),
        'response' => json_encode($response->json(), JSON_PRETTY_PRINT)
    ]);

    if (!$response->ok()) {
        throw new \Exception($response->body(), $response->status());
    }

    $pnrData = $response->json();

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

    $response = Http::withToken($token)->get($url);

    // Log request and response
    \Log::info('Get Booking API Call', [
        'url'      => $url,
        'request'  => ['orderId' => $orderId],
        'status'   => $response->status(),
        'response' => json_encode($response->json(), JSON_PRETTY_PRINT),
    ]);

    if (!$response->ok()) {
        throw new \Exception($response->body(), $response->status());
    }

    return [
        'success' => true,
        'data'    => $response->json(),
    ];
}

}

