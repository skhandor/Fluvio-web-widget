# Make.com Webhook Modification Guide
## Adding Chat Support to Your Existing Voice Webhook

This guide shows how to modify your existing Make.com webhook to support both voice calls and text chat using the same endpoint.

## Current Webhook Flow (Voice Only)
```
Widget → Make.com → Retell Create Web Call API → Access Token → Widget
```

## New Webhook Flow (Voice + Chat)
```
Widget → Make.com → Route by Mode → Retell API → Response → Widget
```

## Step 1: Update Webhook Input Structure

Your webhook currently receives:
```json
{
  "agent_id": "agent_your_agent_id",
  "dynamic_variables": {
    "company_name": "Your Company"
  }
}
```

**Add a new `mode` parameter:**
```json
{
  "agent_id": "agent_your_agent_id",
  "mode": "voice",
  "dynamic_variables": {
    "company_name": "Your Company"
  }
}
```

## Step 2: Add Conditional Logic in Make.com

### 2.1 Add a Router Module
1. In your Make.com scenario, add a **Router** module after your webhook trigger
2. Create two routes:
   - **Route 1**: Voice calls (`mode = "voice"` or `mode` is empty)
   - **Route 2**: Chat (`mode = "chat"`)

### 2.2 Configure Route Filters
**Voice Route Filter:**
```
{{1.mode}} = "voice" OR {{1.mode}} = ""
```

**Chat Route Filter:**
```
{{1.mode}} = "chat"
```

## Step 3: Configure Voice Route (Existing Logic)

Keep your existing Retell API call for voice:

**HTTP Module Settings:**
- **URL**: `https://api.retellai.com/v2/create-web-call`
- **Method**: POST
- **Headers**: 
  ```
  Authorization: Bearer YOUR_RETELL_API_KEY
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "agent_id": "{{1.agent_id}}",
    "retell_llm_dynamic_variables": {{1.dynamic_variables}}
  }
  ```

## Step 4: Configure Chat Route (New Logic)

Add a new HTTP module for chat:

**HTTP Module Settings:**
- **URL**: `https://api.retellai.com/v2/create-chat`
- **Method**: POST
- **Headers**: 
  ```
  Authorization: Bearer YOUR_RETELL_API_KEY
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "agent_id": "{{1.agent_id}}",
    "retell_llm_dynamic_variables": {{1.dynamic_variables}}
  }
  ```

## Step 5: Format Responses

### Voice Response (Existing)
Return the access token as before:
```json
{
  "access_token": "{{retell_response.access_token}}"
}
```

### Chat Response (New)
Return the chat ID with mode indicator:
```json
{
  "chat_id": "{{retell_response.chat_id}}",
  "mode": "chat"
}
```

## Step 6: Merge Routes

Use an **Aggregator** or **Array Aggregator** to merge both routes back into a single response.

## Complete Make.com Scenario Structure

```
Webhook Trigger
    ↓
Router (mode check)
    ├── Voice Route
    │   ├── HTTP: Create Web Call
    │   └── Response: access_token
    └── Chat Route
        ├── HTTP: Create Chat
        └── Response: chat_id + mode
    ↓
Aggregator (merge responses)
    ↓
Webhook Response
```

## Testing Your Modified Webhook

### Test Voice Mode (Existing)
```bash
curl -X POST "https://hook.us2.make.com/your-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_voice_123",
    "mode": "voice"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test Chat Mode (New)
```bash
curl -X POST "https://hook.us2.make.com/your-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_chat_456", 
    "mode": "chat"
  }'
```

**Expected Response:**
```json
{
  "chat_id": "Jabr9TXYYJHfvl6Syypi88rdAHYHmcq6",
  "mode": "chat"
}
```

## Backward Compatibility

Your existing widget implementations will continue working because:
- If `mode` is not provided, it defaults to voice route
- Voice response format remains unchanged
- Same webhook URL is used

## Error Handling

Add error handling for both routes:

```json
{
  "error": "{{error_message}}",
  "mode": "{{1.mode}}"
}
```

## Next Steps

1. **Modify your Make.com scenario** following steps above
2. **Test both voice and chat modes** using the curl commands
3. **Update your widget** to send the `mode` parameter
4. **Deploy and test** the dual-mode functionality

## Required Retell Setup

Before testing, ensure you have:
- ✅ Voice agent created in Retell dashboard
- ✅ Chat agent created in Retell dashboard  
- ✅ API key with permissions for both web calls and chat
- ✅ Different agent IDs for voice vs chat modes

The modification is simple and maintains full backward compatibility with your existing voice-only implementations.