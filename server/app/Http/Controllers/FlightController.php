<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GetFaresApi;


class FlightController extends Controller
{
     public function search(Request $request, GetFaresApi $api)
    {
        $validated = $request->validate([
            'journeyType' => 'required|integer|in:1,2,3',
            'originDestinations' => 'required|array|min:1',
            'originDestinations.*.origin' => 'required|string',
            'originDestinations.*.destination' => 'required|string',
            'originDestinations.*.departureDateTime' => 'required|date',
            'adultCount' => 'required|integer|min:1',
            'childCount' => 'required|integer|min:0',
            'infantCount' => 'required|integer|min:0',
            'cabinClass' => 'required|string',
            'directOnly' => 'required|boolean',
        ]);

        $results = $api->searchFlights($validated);

        return response()->json(['results' => $results]);
    }

public function revalidate(Request $request, GetFaresApi $api)
{
    try {
        $revalidate = $api->revalidate($request->all());
        \Log::info('Controller response', ['data' => $revalidate]);
        return response()->json($revalidate);
    } catch (\InvalidArgumentException $e) {
        \Log::error('Validation error', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => $e->getMessage(),
            'error' => 'Invalid input'
        ], $e->getCode() ?: 400);
    } catch (\Exception $e) {
        \Log::error('Revalidation error', ['error' => $e->getMessage(), 'code' => $e->getCode()]);
        return response()->json([
            'message' => $e->getMessage(),
            'error' => 'Revalidation failed'
        ], $e->getCode() ?: 500);
    }
}

private function sanitizePayload(array $data): array
{
    foreach ($data as $key => $value) {
        if (is_array($value)) {
            $data[$key] = $this->sanitizePayload($value); // recursive for nested arrays
        } elseif (is_null($value)) {
            $data[$key] = ""; // convert null to empty string
        }
    }
    return $data;
}


public function booking(Request $request, GetFaresApi $api)
{
    $payload = $request->all();

    if (!isset($payload['gstDetails'])) {
        $payload['gstDetails'] = [
            'address1' => '',
            'address2' => '',
            'city' => '',
            'state' => '',
            'pinCode' => '',
            'email' => '',
            'gstNumber' => '',
            'gstPhoneNo' => '',
            'gstCompanyName' => ''
        ];
    }

    if (!isset($payload['address'])) {
        $payload['address'] = [
            "addressName" => "Akbar Offshore",
            "street" => "Dr Ambedkar road ",
            "state" => "Maharashtra",
            "postalCode" => "400014",
            "countryName" => "India",
            "countryCode" => "+91",
            "city" => "Mumbai"
        ];
    }

    $payload = $this->sanitizePayload($payload);

    \Log::info($payload);

    try {
        // Step 1: Create PNR
        $pnrResponse = $api->createPnr($payload);
        $orderId = $pnrResponse['data']['orderId'] ?? null;

        if (!$orderId) {
            return response()->json([
                'success' => false,
                'message' => 'PNR creation failed, no orderId returned',
                'data' => $pnrResponse['data'] ?? []
            ]);
        }

        // Step 2: Get booking status
        $bookingResponse = $api->getBooking($orderId);

        return response()->json($bookingResponse);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ]);
    }
}

}
