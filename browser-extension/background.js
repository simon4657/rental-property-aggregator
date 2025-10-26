// Background service worker

// 監聽擴充功能安裝事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('租屋物件收集工具已安裝');
});

// 監聽來自 content script 或 popup 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendToBackend') {
    sendDataToBackend(request.apiUrl, request.data)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 保持訊息通道開啟以進行異步回應
  }
});

// 發送資料到後端 API
async function sendDataToBackend(apiUrl, data) {
  try {
    const response = await fetch(`${apiUrl}/api/trpc/property.createFromExtension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending data to backend:', error);
    throw error;
  }
}

