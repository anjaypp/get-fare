<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Flight;
use App\Models\Passenger;
use App\Models\Segment;
use App\Models\Baggage;
use App\Http\Controllers\FlightController;
use Illuminate\Support\Facades\Cache;
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
            'page' => 'sometimes|integer|min:1',
            'limit' => 'sometimes|integer|min:1|max:50',
        ]);

        $payload = $request->only([
            'journeyType',
            'originDestinations',
            'adultCount',
            'childCount',
            'infantCount',
            'cabinClass',
            'directOnly',
            'page',
            'limit'
        ]);

        $results = $api->searchFlights($payload);

         return response()->json([
            'results' => $results,
            'traceId' => $results['traceId'] ?? null,
         ]);
    }

    public function paginate(Request $request)
{
    $traceId = $request->query('traceId');
    $page = max(1, (int) $request->query('page', 1));
    $limit = max(1, (int) $request->query('limit', 10));

    if (!$traceId || !Cache::has("flights:{$traceId}")) {
        return response()->json(['error' => 'Invalid or expired traceId'], 400);
    }

    $flights = Cache::get("flights:{$traceId}");
    $totalFlights = count($flights);
    $totalPages = ceil($totalFlights / $limit);
    $page = min($page, $totalPages ?: 1);
    $offset = ($page - 1) * $limit;
    $paginatedFlights = array_slice($flights, $offset, $limit);

    return response()->json([
        'flights' => $paginatedFlights,
        'pagination' => [
            'total' => $totalFlights,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => $totalPages,
        ],
        'traceId' => $traceId,
        'source' => 'cache',
    ]);
}



public function sort(Request $request, GetFaresApi $api)
{
    $request->validate([
        'traceId' => 'required|string',
        'sortBy' => 'required|string|in:departure,arrival,duration,price,stops',
        'order' => 'nullable|string|in:asc,desc',
    ]);

    $traceId = $request->input('traceId');
    $sortBy = $request->input('sortBy');
    $order = $request->input('order', 'asc');

    // Map frontend sortBy to service metadata keys
    $keyMap = [
        'departure' => 'departTime',
        'arrival' => 'arrivalTime',
        'duration' => 'totalDuration',
        'price' => 'minPrice',
        'stops' => 'totalStops',
    ];
    $serviceKey = $keyMap[$sortBy] ?? 'minPrice';

    $result = $api->sortFlights($traceId, $serviceKey, $order);

    return response()->json($result);
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

public function getSeatLayout(Request $request, GetFaresApi $api)
{
    $validated = $request->validate([
        'traceId'        => 'required|string',
        'purchaseIds'    => 'required|array|min:1',
        'purchaseIds.*'  => 'required|string',
    ]);

    try {
        // Use validated data as payload
        $seatLayout = $api->getSeatLayout($validated);
        return response()->json($seatLayout);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ], 500);
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


    try {
    // Step 7 & 8: Create PNR and fetch booking
    $pnrResponse = $api->createPnr($payload);
    $orderId = $pnrResponse['data']['orderId'] ?? null;

    if (!$orderId) {
        return response()->json([
            'success' => false,
            'message' => 'PNR creation failed, no orderId returned',
            'data' => $pnrResponse['data'] ?? []
        ], 400);
    }

    $bookingResponse = $api->getBooking($orderId);
    $bookingData = $bookingResponse['data'] ?? null;

    if (!$bookingData) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch booking details',
        ], 400);
    }

    // Step 9: Save booking before returning to ensure stored data matches API response
    try {
        $savedBooking = $api->saveBooking($bookingData);
        // attach saved booking id for debugging
        $bookingResponse['savedBookingId'] = $savedBooking->id ?? null;
        \Log::info('Booking saved successfully', ['orderId' => $orderId, 'booking_id' => $savedBooking->id ?? null]);
    } catch (\Exception $e) {
        \Log::error('Failed to save booking: ' . $e->getMessage(), ['orderId' => $orderId]);
        // Continue to return API response to client, but do not return DB record to avoid stale data
    }

    // Step 10: Return the API booking response (with optional savedBookingId)
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
