from django.http import HttpResponse, JsonResponse

# First API endpoint (e.g., /api/home)
def home_api(request):
    return HttpResponse("This is the home API response")

# Second API endpoint (e.g., /api/hi)
def hi_api(request):
    return HttpResponse("Hello from the Hi API!")