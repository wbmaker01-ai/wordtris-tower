# 📚 워드트리스 타워 (Wordtris Tower)

테트리스 방식의 교육용 **단어 완성 퍼즐 웹 게임 (Wordtris Tower)**입니다.
위에서 떨어지는 한글 자음/모음 및 영문 알파벳 블록을 원하는 위치에 쌓고, 가로/세로로 단어를 완성하여 점수를 획득하세요!

🔗 **웹 게임 플레이하기**: [https://wbmaker01-ai.github.io/wordtris-tower/](https://wbmaker01-ai.github.io/wordtris-tower/)

---

## ✨ 핵심 기능

1. **글래스모픽 서재(Glassmorphic Library) 비주얼 디자인**
   - 심해 네이비 테마, 블러 처리된 유리 카드, 골드 포인트 및 네온 글자 블록
2. **트라이(Trie) 기반 초고속 가로/세로 단어 검색 엔진**
   - 초등 필수 한글 단어(~3,000개) 및 영단어(~1,500개) 탑재
   - 연속된 글자가 사전에 매칭되면 파티클 폭발과 함께 자동 클리어
3. **실시간 한글 자모 조합 엔진**
   - `ㄱ` + `ㅏ` = `가`, `가` + `ㄴ` = `간`과 같이 인접한 자음/모음이 유니코드 조합 공식에 의해 실시간으로 음절로 결합
4. **중력 연쇄 콤보(Chain Combo) 시스템**
   - 단어가 터진 후 위의 블록들이 아래로 떨어지며 2차, 3차 연속 콤보 폭발 발생
5. **Web Audio 신디사이저 & Web Speech TTS**
   - 순수 Web Audio API 기반 오디오 효과음
   - 단어 완성 시 브라우저 TTS 음성으로 발음 낭독
6. **나만의 단어장 (Word Collection)**
   - 완성한 단어를 자동으로 기록하고 뜻과 발음을 다시 학습할 수 있는 단어장 모달
7. **초보자를 위한 4단계 대화형 튜토리얼 & 상단 가이드**
   - 첫 플레이 시 조작법과 조합 규칙을 친절하게 안내

---

## 🎮 조작 방법

- <kbd>←</kbd> / <kbd>→</kbd> : 좌우 이동
- <kbd>↓</kbd> : 천천히 내려놓기 (Soft Drop)
- <kbd>Space</kbd> : 즉시 하강 (Hard Drop)
- <kbd>R</kbd> : 블록 리롤 (남은 횟수 3회)
- <kbd>P</kbd> / <kbd>ESC</kbd> : 일시 정지
- 모바일 환경을 위한 하단 터치 패드 지원

---

## 🛠️ 기술 스택

- **Frontend**: HTML5 Canvas, Vanilla CSS3 (Glassmorphism), Vanilla ES6 JavaScript
- **Algorithms**: Trie Data Structure ($O(K)$ 단어 탐색), Unicode Hangul Composition
- **APIs**: Web Audio API, Web Speech API (`SpeechSynthesis`), `localStorage`
- **Hosting**: GitHub Pages
