from inngest import Inngest

# Create Inngest client
# Configuration is read from environment variables:
# - INNGEST_DEV=1 for dev mode
# - INNGEST_EVENT_API_BASE_URL for event sending
# - INNGEST_API_BASE_URL for serve registration
inngest_client = Inngest(
    app_id="chatpdf",
)
