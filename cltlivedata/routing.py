from django.urls import re_path
from cltlivedata.consumers.CCCAGGconsumer import LiveDataIndexConsumer
from cltlivedata.consumers.appendINDconsumer import AppendIndicatorsValuesConsumer
websocket_urlpatterns = [
    re_path(r'ws/livetrades/(?P<market>\w+)?/?', LiveDataIndexConsumer.as_asgi()),
    re_path(r'ws/appendindicators/', AppendIndicatorsValuesConsumer.as_asgi()),
]
