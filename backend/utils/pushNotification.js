import webpush from 'web-push';

const sendPushNotification = async (subscription, title, body, url = '/dashboard') => {
  if (!subscription) return;

  // Configure VAPID keys
  webpush.setVapidDetails(
    'mailto:230108048@HBTU.AC.IN', // Change to your email
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const payload = JSON.stringify({
    title: title,
    body: body,
    url: url
  });

  try {
    await webpush.sendNotification(subscription, payload);
    console.log("Push Notification Sent Successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

export default sendPushNotification;