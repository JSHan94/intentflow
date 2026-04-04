# Landing Screen Redesign — Design Spec

## Context
IntentFlow의 초기 화면을 개선하여 유저가 즉시 가능한 액션을 파악하고, Initia 브랜딩과 롤업 아키텍처를 시각적으로 이해할 수 있게 한다.

## Decisions
- **Layout**: Dashboard + Intent Bar
- **Jennie mascot**: Medium — 헤더, 빈 상태, 파싱 로딩, 성공/실패 결과, 웰컴에 등장
- **Jennie asset**: SVG 일러스트 직접 생성 (표정 변화: neutral, happy, loading, sad)
- **Rollup display**: Hub-and-Spoke Map + Hover Detail Popup + Quick Actions
- **Intent input**: 텍스트 기반 NL intent 분석 유지

## Landing Screen 구조

```
┌──────────────────────────────────────────┐
│  [Jennie] IntentFlow  [testnet] [Wallet] │
├──────────────────────────────────────────┤
│                                          │
│         Hub-and-Spoke Network Map        │
│      (L1 중심, 롤업 노드 방사형 배치)      │
│   hover → detail popup + quick actions   │
│                                          │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ INTENT > 자연어 입력...             │  │
│  └────────────────────────────────────┘  │
│  Quick: [Sweep All] [Bridge] [Stake]     │
├──────────────────────────────────────────┤
│  Recent: (최근 히스토리 2-3개)            │
└──────────────────────────────────────────┘
```

## Components

### 1. Hub-and-Spoke Network Map (`NetworkMap.tsx`)
- SVG 기반, L1 중심 + 롤업 노드 원형 배치
- 노드 크기: 잔액 비례 (min 30px, max 60px)
- 연결선: dashed line, 각 체인 색상
- **Hover popup**: 체인명, chain_id, VM type, 잔액 목록, IBC channel
- **Quick actions** (클릭 시): Sweep to L1, Bridge to here, View on Explorer
- 잔액 없으면 노드 opacity 줄임
- 지갑 미연결 시 mock 데이터로 구조만 표시

### 2. Jennie SVG Mascot (`JennieIcon.tsx`)
- 4가지 표정: `neutral`, `happy`, `thinking`, `sad`
- 사이즈: sm(24px), md(32px), lg(48px)
- 사용 위치:
  - 헤더 로고 옆 (sm, neutral)
  - 웰컴 화면 (lg, neutral) — 지갑 미연결 시
  - 파싱 로딩 (md, thinking)
  - 실행 성공 (md, happy)
  - 실행 실패 (md, sad)
  - 빈 상태 (lg, neutral)

### 3. Quick Action Chips
- Sweep All INIT to L1
- Bridge Assets
- Stake INIT
- 클릭 시 해당 intent 텍스트가 자동 입력 + 파싱 시작

### 4. Intent Input Bar (유지)
- 현재 텍스트 입력 유지
- preset chips → quick action chips로 교체
- 위치: 네트워크 맵 아래

### 5. Recent History (신규)
- 최근 2-3개 실행 결과를 하단에 간략히 표시
- localStorage에서 읽기

## Files to Create/Modify

### New:
- `src/components/network/NetworkMap.tsx` — hub-and-spoke SVG map
- `src/components/network/ChainNode.tsx` — 개별 체인 노드
- `src/components/network/ChainPopup.tsx` — hover detail popup
- `src/components/ui/JennieIcon.tsx` — SVG mascot with expressions
- `src/components/intent/QuickActions.tsx` — quick action chips
- `src/components/history/RecentHistory.tsx` — 최근 실행 요약

### Modify:
- `src/app/page.tsx` — landing 레이아웃 교체
- `src/components/layout/Header.tsx` — Jennie 아이콘 추가
- `src/components/intent/ParseAnimation.tsx` — Jennie thinking 추가
- `src/components/result/ResultSummary.tsx` — Jennie happy/sad 추가
