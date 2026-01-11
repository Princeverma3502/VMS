import axios from 'axios';
import WebhookLog from '../models/WebhookLog.js';
import CollegeSettings from '../models/CollegeSettings.js';

export const triggerWebhook = async (collegeId, eventType, payload) => {
  try {
    // 1. Check if college has webhooks enabled
    const settings = await CollegeSettings.findOne({ collegeId });
    if (!settings || !settings.webhookUrl) return;

    console.log(`🚀 Triggering Webhook: ${eventType} -> ${settings.webhookUrl}`);

    const webhookPayload = {
      event: eventType,
      timestamp: new Date(),
      data: payload,
      collegeId
    };

    // 2. Send Request
    const response = await axios.post(settings.webhookUrl, webhookPayload, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });

    // 3. Log Success
    await WebhookLog.create({
      collegeId,
      eventType,
      webhookEndpoint: settings.webhookUrl,
      payload: webhookPayload,
      status: 'success',
      httpStatusCode: response.status,
      responseBody: JSON.stringify(response.data).substring(0, 1000), // Truncate if too long
      sentAt: new Date()
    });

  } catch (error) {
    // 4. Log Failure
    console.error(`Webhook Failed: ${error.message}`);
    await WebhookLog.create({
      collegeId,
      eventType,
      webhookEndpoint: settings?.webhookUrl || 'unknown',
      payload: payload,
      status: 'failed',
      errorMessage: error.message,
      nextRetryAt: new Date(Date.now() + 1000 * 60 * 5) // Retry in 5 mins (logic handled by job scheduler)
    });
  }
};