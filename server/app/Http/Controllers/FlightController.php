<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Flight;
use App\Models\Passenger;
use App\Models\Segment;
use App\Models\Baggage;
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

        $payload = $request->only([
            'journeyType',
            'originDestinations',
            'adultCount',
            'childCount',
            'infantCount',
            'cabinClass',
            'directOnly'
        ]);

        $results = $api->searchFlights($payload);

        return response()->json(['results' => $results]);
    }

public function revalidate(Request $request, GetFaresApi $api)
{
    $validated = $request->validate([
        'traceId'     => 'required|string',
        'purchaseIds' => 'required|array|min:1',
        'purchaseIds.*' => 'required|string',
    ]);

    $payload = [
    'traceId' => $validated['traceId'],
    'purchaseIds' => array_map('strval', $validated['purchaseIds']),
    ];

    try {
        $revalidate = $api->revalidate($payload);
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
    // Step 1: Validate the request
    $validated = $request->validate([
        'traceId' => 'required|string',
        'purchaseIds' => 'required|array|min:1',
        'purchaseIds.*' => 'required|string',
        'isHold' => 'required|boolean',
        'passengers' => 'required|array|min:1',
        'passengers.*.paxType' => 'required|string|in:ADT,CHD,INF',
        'passengers.*.title' => 'nullable|string|in:Mr,Ms,Mrs',
        'passengers.*.firstName' => 'nullable|string|max:255',
        'passengers.*.lastName' => 'nullable|string|max:255',
        'passengers.*.dob' => 'nullable|date',
        'passengers.*.genderType' => 'nullable|string|in:M,F',
        'passengers.*.email' => 'nullable|email|max:255',
        'passengers.*.mobile' => 'nullable|string|max:15',
        'passengers.*.areaCode' => 'nullable|string|max:10',
        'passengers.*.ffNumber' => 'nullable|string|max:50',
        'passengers.*.passportNumber' => 'nullable|string|max:50',
        'passengers.*.passengerNationality' => 'nullable|string|size:2',
        'passengers.*.passportDOI' => 'nullable|date',
        'passengers.*.passportDOE' => 'nullable|date',
        'passengers.*.passportIssuedCountry' => 'nullable|string|size:2',
        'passengers.*.seatPref' => 'nullable|string|in:W,A,N',
        'passengers.*.mealPref' => 'nullable|string|max:50',
        'passengers.*.ktn' => 'nullable|string|max:50',
        'passengers.*.redressNo' => 'nullable|string|max:50',
        'passengers.*.serviceReference' => 'nullable|array',
        'passengers.*.serviceReference.*.baggageRefNo' => 'nullable|string',
        'passengers.*.serviceReference.*.MealsRefNo' => 'nullable|string',
        'passengers.*.serviceReference.*.SeatRefNo' => 'nullable|string',
        'passengers.*.serviceReference.*.SegmentInfo' => 'nullable|string',
    ]);

    // Step 2: Build the payload
    $payload = $request->only([
        'traceId',
        'purchaseIds',
        'isHold',
        'passengers',
    ]);

    // Step 3: Add default GST details (required by API)
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

    // Step 4: Add default address
    $payload['address'] = [
        'addressName' => 'Akbar Offshore',
        'street' => 'Dr Ambedkar road',
        'state' => 'Maharashtra',
        'postalCode' => '400014',
        'countryName' => 'India',
        'countryCode' => '+91',
        'city' => 'Mumbai'
    ];

    // Step 5: Sanitize the payload
    $payload = $this->sanitizePayload($payload);

    // Step 6: Log the payload for debugging
    \Log::info('Booking Payload: ', $payload);

    try {
        // Step 7: Create PNR
        $pnrResponse = $api->createPnr($payload);
        $orderId = $pnrResponse['data']['orderId'] ?? null;

        if (!$orderId) {
            return response()->json([
                'success' => false,
                'message' => 'PNR creation failed, no orderId returned',
                'data' => $pnrResponse['data'] ?? []
            ], 400);
        }

        // Step 8: Get booking status/details
        $bookingResponse = $api->getBooking($orderId);
        $bookingData = $bookingResponse['data'] ?? null;

        if (!$bookingData) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch booking details',
            ], 400);
        }

        // TODO: Save bookingData to database

        // Step 9: Return the booking response
        return response()->json($bookingResponse);

    } catch (\Exception $e) {
        \Log::error('Booking Error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'An error occurred: ' . $e->getMessage(),
        ], 500);
    }
}

}
