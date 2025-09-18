# 농업 AI 콜백 API 통합 가이드

## 📋 개요

농업 AI 서비스에서 생성된 상세페이지 HTML 콘텐츠를 **자동으로** 회사 시스템으로 전송하는 콜백 API 방식입니다.

## 🔄 동작 방식

```
1. 사용자: 농업 AI에서 "🔑 토큰키" 버튼 클릭
2. 시스템: 토큰 생성 → HTML 콘텐츠 조회 → 회사 API로 자동 전송
3. 회사: Laravel 시스템에서 콘텐츠 자동 업데이트
```

## 🎯 회사에서 구현해야 할 사항

### 1. API 엔드포인트 준비

다음 엔드포인트가 이미 준비되어 있어야 합니다:

```
본서버: https://academy.runmoa.com/api/farm-contents-update
개발서버: http://dev01.schoolmoa.net/api/farm-contents-update
```

### ⚠️ CSRF 토큰 오류 해결 (중요!)

현재 **419 Page Expired** 오류가 발생하고 있습니다. 다음 중 하나의 방법으로 해결해주세요:

**방법 1: CSRF 예외 처리 (권장)**
`app/Http/Middleware/VerifyCsrfToken.php` 파일 수정:
```php
protected $except = [
    'api/farm-contents-update',  // 이 라인 추가
];
```

**방법 2: API 라우트로 이동 (권장)**
`routes/api.php`에 라우트 정의:
```php
Route::post('/farm-contents-update', [FarmContentController::class, 'update']);
```

### 2. API 요청 형식

농업 AI에서 다음과 같은 POST 요청을 전송합니다:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "description": "<p>AI가 생성한 <strong>HTML 형식</strong>의 콘텐츠</p>"
}
```

### 3. API 응답 형식

**성공 시 (HTTP 200):**
```json
{
  "success": true,
  "message": "Content updated successfully",
  "item_id": 456,
  "item_type": "product"
}
```

**실패 시 (HTTP 200이지만 논리적 오류):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**또는 실패 시 (HTTP 4xx/5xx):**

**400 Bad Request - 누락된 매개변수:**
```json
{
  "error": "Missing required parameters: token or description"
}
```

**401 Unauthorized - 잘못된 토큰:**
```json
{
  "error": "Invalid or expired token"
}
```

**403 Forbidden - 사이트 ID 불일치:**
```json
{
  "error": "Site ID mismatch"
}
```

**419 Page Expired - CSRF 토큰 오류:**
```html
<!DOCTYPE html>...Page Expired...
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to update content"
}
```

**중요**: 농업 AI는 HTTP 상태 코드와 `success` 필드를 모두 확인하여 상세한 오류 처리를 수행합니다.

## 🚀 사용 방법

### 1. 농업 AI에서 토큰키 클릭
- 농업 AI 분석 페이지에서 "🔑 토큰키" 버튼을 클릭합니다
- 시스템이 자동으로 HTML 콘텐츠를 회사 API로 전송합니다

### 2. 결과 확인
- 성공 시: "🎉 콘텐츠가 성공적으로 전송되었습니다!" 메시지 표시
- 실패 시: 오류 메시지와 함께 토큰 정보 제공 (수동 처리용)

## 🔧 기술적 세부사항

### 토큰 처리
- JWT 토큰 형식으로 site_id, item_id, item_type 등 포함
- 24시간 유효기간
- 회사 시스템에서 토큰 검증 및 해당 아이템 업데이트

### HTML 콘텐츠
- **전송 형태**: body 태그 내용만 추출하여 전송 (완전한 HTML 문서가 아닌 콘텐츠만)
- **보안 처리**: XSS 방지를 위한 태그 정리 완료
- **허용된 태그**: `<div>`, `<p>`, `<h1-h6>`, `<strong>`, `<em>`, `<ul>`, `<ol>`, `<li>`, `<br>`, `<span>`, `<a>`, `<img>` 등
- **스타일링**: 인라인 CSS 스타일 포함 (`style="..."` 속성)
- **구조**: 농업 AI가 생성한 상세페이지 레이아웃 (헤더, 정보 그리드, 특징, 스토리 등)

### 에러 처리
- 본서버와 개발서버 순차적으로 시도
- 네트워크 오류, 인증 오류, 서버 오류 등 상세한 에러 로깅
- 실패 시 토큰 정보 제공으로 수동 처리 가능

## 📄 실제 전송되는 HTML 콘텐츠 예시

농업 AI에서 실제로 전송되는 HTML 콘텐츠는 다음과 같은 구조입니다:

```html
<div class="container">
    <div class="header">
        <h1 class="hero-title">🌱 오늘 아침에 딴 토마토가 당신의 건강한 하루를 시작합니다</h1>
        <p class="hero-subtitle">AI가 이 소중한 토마토을 성공적으로 분석했습니다.</p>
        <div class="seasonal-message">
            ✨ 신선함과 영양이 가득한 자연의 선물을 만나보세요
        </div>
    </div>
    
    <img src="이미지URL" alt="토마토" class="product-image">
    
    <div class="info-grid">
        <div class="info-card">
            <div class="info-label">🌱 작물명</div>
            <div class="info-value">토마토</div>
        </div>
        <div class="info-card">
            <div class="info-label">📊 신뢰도</div>
            <div class="info-value">95%</div>
        </div>
        <!-- 더 많은 정보 카드들... -->
    </div>
    
    <div class="price-highlight">
        <h2 style="margin: 0 0 10px 0; font-size: 1.5em;">💰 판매 정보</h2>
        <p style="margin: 0; font-size: 1.3em;"><strong>1kg</strong> 당 <strong>8000원</strong></p>
    </div>
    
    <!-- 결론부터, 스토리, 특징 등 더 많은 섹션들... -->
</div>
```

**특징:**
- 완전한 상세페이지 레이아웃 포함
- 인라인 CSS 스타일로 디자인 적용
- 농업 AI 분석 결과를 바탕으로 한 맞춤형 콘텐츠
- 반응형 디자인 지원

## 📞 문의사항

콜백 API 연동 관련 문의사항이 있으시면 농업 AI 개발팀으로 연락해주세요.

---

**참고**: 이 방식은 기존의 "사용자가 직접 버튼을 클릭하여 콘텐츠를 가져오는 방식"에서 "자동으로 콘텐츠를 전송하는 방식"으로 변경된 것입니다.