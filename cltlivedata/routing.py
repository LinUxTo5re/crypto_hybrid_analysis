from django.urls import re_path
from cltlivedata.consumers.CCCAGGconsumer import LiveDataIndexConsumer
websocket_urlpatterns = [
    re_path(r'ws/livetrades/(?P<market>\w+)?/?', LiveDataIndexConsumer.as_asgi()),
]
