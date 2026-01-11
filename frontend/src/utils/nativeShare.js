export const shareContent = async (title, text, url) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: text,
        url: url || window.location.href,
      });
      console.log('Successfully shared');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(`${text} ${url}`);
    alert("Link copied to clipboard!");
  }
};