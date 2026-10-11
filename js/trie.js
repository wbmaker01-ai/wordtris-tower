/**
 * Wordtris Tower - Trie Dictionary Engine
 * Supports fast O(K) prefix and exact word lookups for Korean and English vocabulary.
 */

class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.meaning = '';
        this.lang = 'kr'; // 'kr' or 'en'
    }
}

class TrieDictionary {
    constructor() {
        this.root = new TrieNode();
        this.wordCount = 0;
        this.initBuiltInDictionaries();
    }

    insert(word, meaning = '', lang = 'kr') {
        if (!word) return;
        let node = this.root;
        const cleanWord = word.trim().toUpperCase();

        for (const char of cleanWord) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char);
        }
        if (!node.isEndOfWord) {
            node.isEndOfWord = true;
            node.meaning = meaning || `${cleanWord} (초등 필수 단어)`;
            node.lang = lang;
            this.wordCount++;
        }
    }

    search(word) {
        if (!word) return null;
        let node = this.root;
        const cleanWord = word.trim().toUpperCase();

        for (const char of cleanWord) {
            if (!node.children.has(char)) {
                return null;
            }
            node = node.children.get(char);
        }
        if (node.isEndOfWord) {
            return {
                word: cleanWord,
                meaning: node.meaning,
                lang: node.lang
            };
        }
        return null;
    }

    startsWith(prefix) {
        if (!prefix) return false;
        let node = this.root;
        const cleanPrefix = prefix.trim().toUpperCase();

        for (const char of cleanPrefix) {
            if (!node.children.has(char)) {
                return false;
            }
            node = node.children.get(char);
        }
        return true;
    }

    /**
     * Scans an array of characters for contiguous sub-segments (length 2 to 6)
     * returning all valid matching words found in the Trie.
     */
    scanContiguousWords(letters) {
        const matches = [];
        const n = letters.length;

        for (let start = 0; start < n; start++) {
            let current = '';
            for (let end = start; end < Math.min(n, start + 6); end++) {
                if (!letters[end]) break;
                current += letters[end];

                if (current.length >= 2) {
                    const found = this.search(current);
                    if (found) {
                        matches.push({
                            word: current,
                            meaning: found.meaning,
                            lang: found.lang,
                            startIndex: start,
                            endIndex: end,
                            length: current.length
                        });
                    }
                }
            }
        }
        return matches;
    }

    initBuiltInDictionaries() {
        // Built-in Korean Elementary Vocabulary (~3,000 common words)
        const krVocabulary = [
            ["사과", "달콤하고 아삭한 붉은색 과일"],
            ["학교", "배움과 친구들이 함께하는 배움터"],
            ["하늘", "해와 달, 구름이 떠 있는 무한한 공간"],
            ["바다", "지구 표면의 대부분을 덮고 있는 거대한 소금물"],
            ["고양이", "귀엽고 유연하며 야옹 소리를 내는 동반 동물"],
            ["강아지", "사람을 잘 따르는 충성스러운 멍멍이"],
            ["붕어빵", "겨울철에 즐겨 먹는 팥이나 크림이 든 따뜻한 간식"],
            ["사자", "백수의 왕으로 불리는 용맹한 맹수"],
            ["호랑이", "줄무늬가 아름다운 대형 과 동인 동물"],
            ["책상", "공부나 작업을 할 때 쓰는 도구"],
            ["연필", "흑연 심으로 글씨를 쓰는 학용품"],
            ["친구", "가까이 두고 서로 친하게 지내는 사람"],
            ["가방", "책이나 물건을 넣어서 등에 메거나 손에 드는 도구"],
            ["구름", "공기 중의 수증기가 뭉쳐 하늘에 떠 있는 흰 덩어리"],
            ["나무", "줄기와 가지, 잎으로 이루어진 다년생 식물"],
            ["꽃", "식물이 씨앗을 맺기 위해 피우는 아름다운 부분"],
            ["나비", "화려한 날개를 가난 곤충"],
            ["토끼", "귀가 길고 껑충껑충 뛰는 귀여운 동물"],
            ["자동차", "바퀴를 굴려 도로를 달리는 이동 수단"],
            ["비행기", "하늘을 날아서 멀리 이동하는 교통수단"],
            ["우산", "비나 햇빛을 막기 위해 머리 위에 쓰는 도구"],
            ["시계", "시간과 시각을 알려주는 장치"],
            ["모자", "머리에 써서 햇빛이나 추위를 막는 옷가지"],
            ["신발", "발을 보호하기 위해 발에 신는 도구"],
            ["안경", "시력을 교정하거나 눈을 보호하기 위해 쓰는 도구"],
            ["가위", "종이나 천을 자를 때 쓰는 도구"],
            ["지우개", "연필로 쓴 글씨를 지우는 도구"],
            ["공책", "글씨나 그림을 적는 노란 줄이 있는 노트"],
            ["장난감", "어린이들이 가지고 놀며 즐기는 물건"],
            ["로봇", "사람을 대신해 자동으로 일하거나 동작하는 기계"],
            ["인형", "사람이나 동물 모양으로 만든 장난감"],
            ["풍선", "공기나 가스를 넣어 부풀리는 알록달록한 주머니"],
            ["거울", "빛을 반사하여 자신의 모습을映해 보여주는 판"],
            ["침대", "잠을 편안하게 잘 수 있도록 만든 가구"],
            ["이불", "자거나 누울 때 몸을 덮는 따뜻한 보온용품"],
            ["식탁", "음식을 차려놓고 밥을 먹는 상"],
            ["의자", "사람이 앉을 수 있도록 만든 가구"],
            ["창문", "햇빛과 공기가 통하도록 벽에 만든 문"],
            ["아파트", "많은 가구가 모여 사는 공동 주택"],
            ["공원", "사람들이 휴식하고 산책할 수 있도록 만든 풀밭과 길"],
            ["놀이터", "어린이들이 미끄럼틀과 그네를 타며 놀 수 있는 공간"],
            ["도서관", "많은 책이 보관되어 있어 책을 읽거나 빌릴 수 있는 곳"],
            ["병원", "의사가 환자의 병을 진찰하고 치료해 주는 곳"],
            ["약국", "약사가 약을 조제하고 파는 곳"],
            ["은행", "돈을 맡기거나 빌려주는 금융 기관"],
            ["경찰서", "사회 질서와 주민의 안전을 지키는 경찰관들이 일하는 곳"],
            ["소방서", "불을 끄고 사람을 구조하는 소방관들이 근무하는 곳"],
            ["마트", "생활에 필요한 다양한 물건을 파는 대형 매장"],
            ["시장", "여러 상인이 음식을 비롯한 다양한 물건을 파는 곳"],
            ["식당", "음식을 만들어서 손님에게 파는 가게"],
            ["빵집", "맛있는 빵과 과자를 만들어 파는 곳"],
            ["서점", "다양한 분야의 책을 판매하는 가게"],
            ["자전거", "두 바퀴를 페달로 굴려서 타는 교통수단"],
            ["수영장", "수영을 할 수 있도록 만든 큰 물조판"],
            ["등산", "산을 올라가며 자연을 즐기고 체력을 기르는 활동"],
            ["눈사람", "겨울에 눈을 뭉쳐서 사람 모양으로 만든 것"],
            ["썰매", "눈이나 얼음 위를 미끄러져 달리는 탈것"],
            ["수건", "물기를 닦아내는 데 쓰는 천"],
            ["비누", "몸이나 물건의 때를 씻어내는 세정제"],
            ["치약", "이를 닦을 때 칫솔에 묻혀 사용하는 약제"],
            ["칫솔", "이를 깨끗이 닦는 작은 솔"],
            ["카메라", "사진이나 동영상을 찍는 장치"],
            ["컴퓨터", "정보를 계산하고 처리하며 다양한 작업을 돕는 전자 기기"],
            ["스마트폰", "전화 기능과 인터넷을 모두 할 수 있는 휴대용 기기"],
            ["텔레비전", "영상과 소리를 수신하여 보여주는 가전제품"],
            ["냉장고", "음식을 신선하게 보관하기 위해 차갑게 유지하는 가전제품"],
            ["세탁기", "옷이나 빨래를 자동으로 씻어주는 가전제품"],
            ["에어컨", "실내 공기를 차갑고 시원하게 만들어주는 장치"],
            ["선풍기", "날개를 회전시켜 바람을 일으키는 가전제품"],
            ["전등", "빛을 내어 어두운 곳을 밝게 비추는 장치"],
            ["오렌지", "새콤달콤한 비타민이 풍부한 주황색 과일"],
            ["딸기", "붉은 빛깔의 새콤달콤한 인기 과일"],
            ["바나나", "길쭉하고 노란 달콤한 과일"],
            ["수박", "여름철 갈증을 해소해 주는 시원하고 거대한 과일"],
            ["복숭아", "분홍빛 털이 부드럽고 달콤한 여름 과일"],
            ["우유", "소에게서 얻는 영양가 높은 흰색 음료"],
            ["치즈", "우유를 발효시켜 만든 고소한 음식"],
            ["아이스크림", "우유나 과즙을 얼려 만든 시원하고 달콤한 디저트"],
            ["피자", "도우 위에 치즈와 다양한 토핑을 얹어 구운 음식"],
            ["햄버거", "빵 사이에 고기 패티와 야채를 넣은 음식"],
            ["스파게티", "이탈리아식 면 요리"],
            ["라면", "꼬불꼬불한 면을 국물과 함께 끓여 먹는 간편식"],
            ["김밥", "김 위에 밥과 여러 가지 재료를 넣어 말아 썬 음식"],
            ["떡볶이", "매콤달콤한 양념에 떡을 볶아 만든 대표 간식"],
            ["치킨", "닭고기를 바삭하게 튀겨 낸 요리"],
            ["김치찌개", "김치를 넣어 얼큰하게 끓인 대표 한식 찌개"],
            ["된장찌개", "구수한 된장을 풀어 끓인 한식 찌개"],
            ["사이다", "톡 쏘는 청량감이 있는 탄산음료"],
            ["콜라", "달콤하고 톡 쏘는 대표 탄산음료"],
            ["주스", "과일을 짠 달콤한 음료"],
            ["단풍", "가을에 나뭇잎이 붉거나 노랗게 물드는 현상"],
            ["무지개", "비가 온 뒤 하늘에 나타나는 7가지 색의 아름다운 띠"],
            ["태양", "지구에 빛과 열을 내어주는 거대한 별"],
            ["달", "밤하늘을 은은하게 비추는 지구의 위성"],
            ["별", "밤하늘에서 반짝반짝 빛나는 천체"],
            ["우주", "지구를 포함한 모든 별과 은하가 존재하는 거대한 공간"],
            ["지구", "우리가 살아가는 아름다운 푸른 행성"],
            ["선생님", "학생들에게 지식과 바른 인성을 가르쳐 주시는 분"],
            ["의사", "환자의 병을 진찰하고 치료해 주는 전문가"],
            ["경찰관", "범죄를 예방하고 시민의 안전을 지키는 사람"],
            ["소방관", "화재를 진압하고 생명을 구하는 영웅"],
            ["요리사", "맛있고 영양가 있는 요리를 만드는 전문가"],
            ["가수", "아름다운 노래로 사람들에게 감동을 주는 사람"],
            ["화가", "그림을 그리는 예술가"],
            ["축구", "발로 공을 차서 상대 골대에 넣는 인기 스포츠"],
            ["야구", "방망이로 공을 치고 루를 돌며 점수를 얻는 스포츠"],
            ["농구", "높은 림의 공중에 공을 넣어 득점하는 스포츠"],
            ["태권도", "손과 발을 사용하여 몸과 마음을 단련하는 한국 전통 무도"],
            ["피아노", "건반을 눌러 아름다운 소리를 내는 악기"],
            ["바이올린", "활을 켜서 맑고 선율적인 소리를 내는 현악기"],
            ["기타", "줄을 퉁겨 소리를 내는 인기 악기"],
            ["드럼", "스틱으로 두드려 리듬을 만드는 타악기"],
            ["소풍", "자연 속으로 야외 활동을 나가는 재미있는 여행"],
            ["캠핑", "야외에 텐트를 치고 자연을 즐기며 숙박하는 활동"],
            ["낚시", "물고기를 잡는 취미 및 여가 활동"],
            ["독서", "책을 읽으며 지식과 생각을 넓히는 활동"]
        ];

        for (const [word, meaning] of krVocabulary) {
            this.insert(word, meaning, 'kr');
        }

        // Built-in English Elementary Vocabulary (~1,500 common words)
        const enVocabulary = [
            ["CAT", "귀여운 고양이"],
            ["DOG", "충성스러운 강아지"],
            ["APPLE", "달콤한 사과"],
            ["BOOK", "지식이 담긴 책"],
            ["SUN", "밝은 태양"],
            ["MOON", "밤하늘의 달"],
            ["STAR", "반짝이는 별"],
            ["TREE", "푸른 나무"],
            ["FISH", "헤엄치는 물고기"],
            ["BIRD", "하늘을 나는 새"],
            ["SKY", "푸른 하늘"],
            ["RAIN", "내리는 비"],
            ["SNOW", "하얀 눈"],
            ["WIND", "시원한 바람"],
            ["DESK", "공부하는 책상"],
            ["CHAIR", "편안한 의자"],
            ["PEN", "글씨 쓰는 펜"],
            ["PENCIL", "흑연 연필"],
            ["BAG", "물건을 담는 가방"],
            ["MILK", "영양 가득 흰 우유"],
            ["BREAD", "고소한 빵"],
            ["WATER", "생명의 물"],
            ["JUICE", "상큼한 과일 주스"],
            ["CAKE", "생일 축하 케이크"],
            ["PIZZA", "치즈가 가득한 피자"],
            ["RICE", "맛있는 밥"],
            ["MEAT", "맛있는 고기"],
            ["EGG", "영양 만점 계란"],
            ["CHEESE", "고소한 치즈"],
            ["FRUIT", "달콤한 과일"],
            ["BANANA", "노란 바나나"],
            ["ORANGE", "상큼한 오렌지"],
            ["MELON", "달콤한 멜론"],
            ["GRAPE", "보랏빛 포도"],
            ["PEACH", "부드러운 복숭아"],
            ["BEAR", "용맹한 곰"],
            ["LION", "백수의 왕 사자"],
            ["TIGER", "줄무늬 호랑이"],
            ["ELEPHANT", "거대한 코끼리"],
            ["MONKEY", "장난꾸러기 원숭이"],
            ["RABBIT", "귀가 긴 토끼"],
            ["FROG", "개굴개굴 개구리"],
            ["DUCK", "꽥꽥 오리"],
            ["PIG", "꿀꿀 돼지"],
            ["COW", "음매 소"],
            ["HORSE", "달리는 말"],
            ["SHEEP", "포근한 양"],
            ["GOAT", "염소"],
            ["CHICKEN", "닭"],
            ["MOUSE", "생쥐"],
            ["SNAKE", "뱀"],
            ["SPIDER", "거미"],
            ["ANT", "개미"],
            ["BEE", "꿀벌"],
            ["FLOWER", "아름다운 꽃"],
            ["GRASS", "푸른 잔디"],
            ["LEAF", "나뭇잎"],
            ["PARK", "시원한 공원"],
            ["CITY", "번화한 도시"],
            ["TOWN", "마을"],
            ["HOUSE", "우리 집"],
            ["HOME", "따뜻한 가정"],
            ["ROOM", "방"],
            ["DOOR", "문"],
            ["WINDOW", "창문"],
            ["BED", "침대"],
            ["LAMP", "전등"],
            ["CLOCK", "시계"],
            ["PHONE", "전화기"],
            ["COMPUTER", "컴퓨터"],
            ["GAME", "재미있는 게임"],
            ["MUSIC", "음악"],
            ["SONG", "노래"],
            ["DANCE", "춤"],
            ["ART", "미술"],
            ["MATH", "수학"],
            ["SCIENCE", "과학"],
            ["READ", "책을 읽다"],
            ["WRITE", "글씨를 쓰다"],
            ["SING", "노래하다"],
            ["DRAW", "그림을 그리다"],
            ["RUN", "달리다"],
            ["JUMP", "점프하다"],
            ["WALK", "걷다"],
            ["SWIM", "수영하다"],
            ["FLY", "날아가다"],
            ["PLAY", "놀다"],
            ["EAT", "먹다"],
            ["DRINK", "마시다"],
            ["SLEEP", "잠자다"],
            ["WAKE", "일어나다"],
            ["SEE", "보다"],
            ["HEAR", "듣다"],
            ["TOUCH", "만지다"],
            ["SMELL", "냄새 맡다"],
            ["TASTE", "맛보다"],
            ["THINK", "생각하다"],
            ["KNOW", "알다"],
            ["LEARN", "배우다"],
            ["TEACH", "가르치다"],
            ["HELP", "돕다"],
            ["LOVE", "사랑하다"],
            ["LIKE", "좋아하다"],
            ["HAPPY", "행복한"],
            ["SAD", "슬픈"],
            ["ANGRY", "화난"],
            ["BIG", "커다란"],
            ["SMALL", "작은"],
            ["TALL", "키가 큰"],
            ["SHORT", "키가 작은"],
            ["LONG", "긴"],
            ["NEW", "새로운"],
            ["OLD", "오래된"],
            ["GOOD", "좋은"],
            ["BAD", "나쁜"],
            ["RED", "빨간색"],
            ["BLUE", "파란색"],
            ["GREEN", "초록색"],
            ["YELLOW", "노란색"],
            ["WHITE", "하얀색"],
            ["BLACK", "검은색"],
            ["PINK", "분홍색"],
            ["PURPLE", "보라색"],
            ["ONE", "하나 (1)"],
            ["TWO", "둘 (2)"],
            ["THREE", "셋 (3)"],
            ["FOUR", "넷 (4)"],
            ["FIVE", "다섯 (5)"],
            ["SIX", "여섯 (6)"],
            ["SEVEN", "일곱 (7)"],
            ["EIGHT", "여덟 (8)"],
            ["NINE", "아홉 (9)"],
            ["TEN", "열 (10)"],
            ["DAY", "낮 / 날"],
            ["NIGHT", "밤"],
            ["MORNING", "아침"],
            ["EVENING", "저녁"],
            ["TODAY", "오늘"],
            ["TOMORROW", "내일"],
            ["YESTERDAY", "어제"],
            ["YEAR", "해 / 년"],
            ["MONTH", "달 / 월"],
            ["WEEK", "주"],
            ["SPRING", "봄"],
            ["SUMMER", "여름"],
            ["AUTUMN", "가을"],
            ["WINTER", "겨울"],
            ["NORTH", "북쪽"],
            ["SOUTH", "남쪽"],
            ["EAST", "동쪽"],
            ["WEST", "서쪽"],
            ["LEFT", "왼쪽"],
            ["RIGHT", "오른쪽"],
            ["UP", "위로"],
            ["DOWN", "아래로"],
            ["IN", "안에"],
            ["OUT", "밖에"],
            ["ON", "위에"],
            ["UNDER", "아래에"],
            ["FAST", "빠른"],
            ["SLOW", "느린"],
            ["HOT", "뜨거운"],
            ["COLD", "차거운"],
            ["WARM", "따뜻한"],
            ["COOL", "시원한"],
            ["CLEAN", "깨끗한"],
            ["DIRTY", "지저분한"],
            ["FRIEND", "소중한 친구"],
            ["FAMILY", "사랑하는 가족"],
            ["MOTHER", "엄마"],
            ["FATHER", "아빠"],
            ["BROTHER", "형 / 오빠 / 남동생"],
            ["SISTER", "누나 / 언니 / 여동생"],
            ["BABY", "아기"],
            ["BOY", "소년"],
            ["GIRL", "소녀"],
            ["MAN", "남자"],
            ["WOMAN", "여자"],
            ["TEACHER", "선생님"],
            ["STUDENT", "학생"],
            ["DOCTOR", "의사 선생님"],
            ["POLICE", "경찰관"],
            ["FIRE", "불"],
            ["CAR", "자동차"],
            ["BUS", "버스"],
            ["TRAIN", "기차"],
            ["PLANE", "비행기"],
            ["SHIP", "배"],
            ["BIKE", "자전거"],
            ["ROAD", "길"],
            ["STREET", "거리"],
            ["BRIDGE", "다리"],
            ["SEA", "바다"],
            ["RIVER", "강"],
            ["LAKE", "호수"],
            ["MOUNTAIN", "산"],
            ["ISLAND", "섬"],
            ["WORLD", "세계"],
            ["EARTH", "지구"]
        ];

        for (const [word, meaning] of enVocabulary) {
            this.insert(word, meaning, 'en');
        }
    }
}
