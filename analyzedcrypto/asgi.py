import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
import cltlivedata.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'analyzedcrypto.settings')

# application = get_asgi_application()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
            URLRouter(
                cltlivedata.routing.websocket_urlpatterns
            )
        ),
})