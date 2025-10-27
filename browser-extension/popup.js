// 載入已儲存的設定
document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.sync.get(['apiUrl']);
  if (result.apiUrl) {
    document.getElementById('apiUrl').value = result.apiUrl;
  }
});

// 儲存設定
document.getElementById('settingsBtn').addEventListener('click', async () => {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  
  if (!apiUrl) {
    showStatus('請輸入 API 網址', 'error');
    return;
  }

  try {
    new URL(apiUrl); // 驗證 URL 格式
    await chrome.storage.sync.set({ apiUrl });
    showStatus('設定已儲存！', 'success');
  } catch (error) {
    showStatus('請輸入有效的網址', 'error');
  }
});

// 擷取資料
document.getElementById('extractBtn').addEventListener('click', async () => {
  const result = await chrome.storage.sync.get(['apiUrl']);
  
  if (!result.apiUrl) {
    showStatus('請先設定 API 網址', 'error');
    return;
  }

  showStatus('正在擷取資料...', 'info');

  try {
    // 取得當前分頁
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 執行內容腳本來擷取資料
    const [response] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractAllData
    });

    if (response && response.result) {
      const propertyData = response.result;
      
      if (!propertyData) {
        showStatus('無法擷取資料，請確認您在租屋網站的物件頁面上', 'error');
        return;
      }
      
      // 發送資料到後端
      await sendToBackend(result.apiUrl, propertyData);
      
      showStatus('✓ 資料已成功加入系統！', 'success');
    } else {
      showStatus('無法擷取資料，請確認您在租屋網站頁面上', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showStatus('發生錯誤：' + error.message, 'error');
  }
});

// 整合的擷取函數（會在頁面上執行）
function extractAllData() {
  const url = window.location.href;
  
  // 591 租屋網
  if (url.includes('591.com.tw')) {
    try {
      const data = {
        url: window.location.href,
        address: '',
        city: '',
        district: '',
        floor: '',
        price: '',
        rooms: '',
        age: '',
        hasElevator: false,
        nearMRT: '',
        source: '591租屋網'
      };

      // 擷取地址
      const addressEl = document.querySelector('.address') || 
                       document.querySelector('[class*="address"]') ||
                       document.querySelector('.detailInfo .txt');
      if (addressEl) {
        data.address = addressEl.textContent.trim();
        
        // 解析縣市和行政區
        const cityMatch = data.address.match(/(台北市|新北市|桃園市|台中市|台南市|高雄市|基隆市|新竹市|嘉義市|新竹縣|苗栗縣|彰化縣|南投縣|雲林縣|嘉義縣|屏東縣|宜蘭縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)/);
        if (cityMatch) {
          data.city = cityMatch[1];
          const districtMatch = data.address.match(/[市縣](.+?[區鎮市鄉])/);
          if (districtMatch) {
            data.district = districtMatch[1];
          }
        }
      }

      // 擷取租金
      const priceEl = document.querySelector('.price') || 
                     document.querySelector('[class*="price"]') ||
                     document.querySelector('.money');
      if (priceEl) {
        const priceText = priceEl.textContent.trim();
        const priceMatch = priceText.match(/[\d,]+/);
        if (priceMatch) {
          data.price = priceMatch[0].replace(/,/g, '');
        }
      }

      // 擷取房型
      const roomEl = document.querySelector('.type') ||
                    document.querySelector('[class*="room"]');
      if (roomEl) {
        const roomText = roomEl.textContent;
        const roomMatch = roomText.match(/(\d+)房/);
        if (roomMatch) {
          data.rooms = roomMatch[1] + '房';
        }
      }

      // 擷取樓層
      const floorEl = document.querySelector('.floor') ||
                     Array.from(document.querySelectorAll('.item')).find(el => el.textContent.includes('樓層'));
      if (floorEl) {
        const floorText = floorEl.textContent;
        const floorMatch = floorText.match(/(\d+)樓/);
        if (floorMatch) {
          data.floor = floorMatch[1];
        }
      }

      // 擷取屋齡
      const ageEl = Array.from(document.querySelectorAll('.item, [class*="info"]')).find(el => el.textContent.includes('屋齡'));
      if (ageEl) {
        const ageText = ageEl.textContent;
        const ageMatch = ageText.match(/(\d+)年/);
        if (ageMatch) {
          data.age = ageMatch[1];
        }
      }

      // 檢查是否有電梯
      const elevatorEl = Array.from(document.querySelectorAll('.item, [class*="info"]')).find(el => el.textContent.includes('電梯'));
      if (elevatorEl) {
        data.hasElevator = elevatorEl.textContent.includes('有') || elevatorEl.textContent.includes('✓');
      }

      // 擷取捷運資訊
      const mrtEl = Array.from(document.querySelectorAll('.item, [class*="traffic"]')).find(el => el.textContent.includes('捷運'));
      if (mrtEl) {
        data.nearMRT = mrtEl.textContent.replace(/捷運|站/g, '').trim();
      }

      return data;
    } catch (error) {
      console.error('591 extraction error:', error);
      return null;
    }
  }
  
  // 信義房屋
  if (url.includes('sinyi.com.tw')) {
    try {
      const data = {
        url: window.location.href,
        address: '',
        city: '',
        district: '',
        floor: '',
        price: '',
        rooms: '',
        age: '',
        hasElevator: false,
        nearMRT: '',
        source: '信義房屋'
      };

      const addressEl = document.querySelector('.address, [class*="address"]');
      if (addressEl) {
        data.address = addressEl.textContent.trim();
      }

      const priceEl = document.querySelector('.price, [class*="price"]');
      if (priceEl) {
        const priceMatch = priceEl.textContent.match(/[\d,]+/);
        if (priceMatch) {
          data.price = priceMatch[0].replace(/,/g, '');
        }
      }

      return data;
    } catch (error) {
      console.error('Sinyi extraction error:', error);
      return null;
    }
  }
  
  // 永慶房仲
  if (url.includes('yungching.com.tw')) {
    try {
      const data = {
        url: window.location.href,
        address: '',
        city: '',
        district: '',
        floor: '',
        price: '',
        rooms: '',
        age: '',
        hasElevator: false,
        nearMRT: '',
        source: '永慶房仲'
      };

      const addressEl = document.querySelector('.address, [class*="address"]');
      if (addressEl) {
        data.address = addressEl.textContent.trim();
      }

      const priceEl = document.querySelector('.price, [class*="price"]');
      if (priceEl) {
        const priceMatch = priceEl.textContent.match(/[\d,]+/);
        if (priceMatch) {
          data.price = priceMatch[0].replace(/,/g, '');
        }
      }

      return data;
    } catch (error) {
      console.error('Yungching extraction error:', error);
      return null;
    }
  }
  
  return null;
}

// 發送資料到後端
async function sendToBackend(apiUrl, data) {
  const response = await fetch(`${apiUrl}/api/trpc/properties.createFromExtension`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ json: data })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`無法連接到伺服器: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// 顯示狀態訊息
function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  
  if (type === 'success') {
    setTimeout(() => {
      statusEl.className = 'status';
      statusEl.textContent = '就緒';
    }, 3000);
  }
}

