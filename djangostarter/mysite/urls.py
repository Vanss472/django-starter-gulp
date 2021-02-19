from django.urls import path
from .views import mysite_index

app_name = 'mysite'
urlpatterns = [
  path('', mysite_index, name='index'),
]