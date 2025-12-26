# Make.com Webhook Modification Guide
## Adding Chat Support to Your Existing Voice Webhook

This guide shows how to modify your existing Make.com webhook to support both voice calls and text chat using the same endpoint.

## Current Webhook Flow (Voice Only)
```
Widget → Make.com → Retell Create Web Call API → Access Token → Widget
```

## New Webhook Flow (Voice + Chat)
```
Widget → Make.com → Route by Mode & Action → Retell API → Response → Widget
```

## Step 1: Update Webhook Input Structure

Your webhook now needs to handle different actions:

**Voice Call Request:**
```json
{
  "project_id": "ZWQ4VZV",
  "mode": "voice"
}
```

**Chat Session Creation:**
```json
{
  "project_id": "ZWQ4VZV", 
  "mode": "chat",
  "action": "create_session"
}
```

**Chat Message Request:**
```json
{
  "project_id": "ZWQ4VZV",
  "mode": "chat", 
  "action": "send_message",
  "chat_id": "chat_abc123",
  "message": "Hello, how are you?"
}
```

## Step 2: Add Router Logic in Make.com

### 2.1 Add a Router Module
1. In your Make.com scenario, add a **Router** module after your webhook trigger
2. Create three routes:
   - **Route 1**: Voice calls (`mode = "voice"`)
   - **Route 2**: Chat session creation (`mode = "chat" AND action = "create_session"`)
   - **Route 3**: Chat messages (`mode = "chat" AND action = "send_message"`)

### 2.2 Configure Route Filters
**Voice Route Filter:**
```
{{1.mode}} = "voice"
```

**Chat Session Route Filter:**
```
{{1.mode}} = "chat" AND {{1.action}} = "create_session"
```

**Chat Message Route Filter:**
```
{{1.mode}} = "chat" AND {{1.action}} = "send_message"
```

## Step 3: Configure API Calls

### Voice Route (Existing)
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
    "agent_id": "YOUR_CHAT_AGENT_ID",
    "retell_llm_dynamic_variables": {{1.dynamic_variables}}
  }
  ```

### Chat Session Route (New)
**HTTP Module Settings:**
- **URL**: `https://api.retellai.com/create-chat`
- **Method**: POST
- **Headers**: 
  ```
  Authorization: Bearer YOUR_RETELL_API_KEY
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "agent_id": "YOUR_CHAT_AGENT_ID",
    "retell_llm_dynamic_variables": {{1.dynamic_variables}}
  }
  ```

### Chat Message Route (New)
**HTTP Module Settings:**
- **URL**: `https://api.retellai.com/create-chat-completion`
- **Method**: POST
- **Headers**: 
  ```
  Authorization: Bearer YOUR_RETELL_API_KEY
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "chat_id": "{{1.chat_id}}",
    "content": "{{1.message}}"
  }
  ```

## Step 4: Format Responses

### Voice Response
```json
{
  "access_token": "{{retell_response.access_token}}"
}
```

### Chat Session Response
```json
{
  "chat_id": "{{retell_response.chat_id}}",
  "mode": "chat",
  "action": "session_created"
}
```

### Chat Message Response
```json
{
  "messages": {{retell_response.messages}},
  "mode": "chat", 
  "action": "message_sent"
}
```

## Complete Make.com Scenario Structure

```
Webhook Trigger
    ↓
Router (mode & action check)
    ├── Voice Route
    │   ├── HTTP: Create Web Call
    │   └── Response: access_token
    ├── Chat Session Route  
    │   ├── HTTP: Create Chat
    │   └── Response: chat_id + mode
    └── Chat Message Route
        ├── HTTP: Create Chat Completion
        └── Response: messages + mode
    ↓
Aggregator (merge responses)
    ↓
Webhook Response
```

## Testing Your Modified Webhook

### Test Voice Mode
```bash
curl -X POST "https://hook.us2.make.com/your-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "ZWQ4VZV",
    "mode": "voice"
  }'
```

### Test Chat Session Creation
```bash
curl -X POST "https://hook.us2.make.com/your-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "ZWQ4VZV",
    "mode": "chat",
    "action": "create_session"
  }'
```

### Test Chat Message
```bash
curl -X POST "https://hook.us2.make.com/your-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "ZWQ4VZV",
    "mode": "chat", 
    "action": "send_message",
    "chat_id": "your_chat_id_from_previous_call",
    "message": "Hello!"
  }'
```

## Required Retell Setup

Before testing, ensure you have:
- ✅ Voice agent created in Retell dashboard
- ✅ Chat agent created in Retell dashboard  
- ✅ API key with permissions for web calls, chat creation, and chat completion
- ✅ Different agent IDs for voice vs chat (or same agent ID if using one agent for both)

## Security Notes

- API key is safely stored in Make.com (not exposed to frontend)
- All Retell API calls go through your webhook
- Widget never directly calls Retell APIs
- Chat sessions are managed server-side

The modification maintains full backward compatibility while adding comprehensive chat support!