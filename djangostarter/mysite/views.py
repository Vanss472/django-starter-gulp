from django.shortcuts import render

# Create your views here.


def mysite_index(request):

    # render function takes argument  - request
    # and return HTML as response
    return render(request, "mysite/index.html")
