const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공
app.use(express.static('public'));

// 메인 라우트
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ngrok 테스트 앱</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                }
                h1 {
                    font-size: 2.5em;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .info {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .btn {
                    background: #4CAF50;
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 16px;
                    margin: 10px;
                    transition: all 0.3s ease;
                }
                .btn:hover {
                    background: #45a049;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 ngrok 테스트 애플리케이션</h1>
                <div class="info">
                    <h3>서버 정보</h3>
                    <p><strong>포트:</strong> ${PORT}</p>
                    <p><strong>시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
                    <p><strong>요청 IP:</strong> ${req.ip || req.connection.remoteAddress}</p>
                </div>
                
                <div class="info">
                    <h3>ngrok으로 이 앱에 접근하기</h3>
                    <p>1. 터미널에서 <code>node app.js</code> 실행</p>
                    <p>2. 새 터미널에서 <code>ngrok http 3000</code> 실행</p>
                    <p>3. 생성된 URL로 외부에서 접근 가능!</p>
                </div>
                
                <button class="btn" onclick="location.reload()">새로고침</button>
                <button class="btn" onclick="testApi()">API 테스트</button>
            </div>
            
            <script>
                function testApi() {
                    fetch('/api/test')
                        .then(response => response.json())
                        .then(data => {
                            alert('API 응답: ' + JSON.stringify(data, null, 2));
                        })
                        .catch(error => {
                            alert('API 오류: ' + error);
                        });
                }
            </script>
        </body>
        </html>
    `);
});

// API 엔드포인트
app.get('/api/test', (req, res) => {
    res.json({
        message: '안녕하세요! ngrok으로 접근하고 있습니다.',
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log('ngrok을 사용하려면: ngrok http 3000');
});
