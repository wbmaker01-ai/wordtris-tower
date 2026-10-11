/**
 * Wordtris Tower - Wordbook Collection Manager
 * Manages player's discovered words, local storage persistence, filtering, and modal rendering.
 */

class Wordbook {
    constructor(storageKey = 'wordtris_wordbook_v1') {
        this.storageKey = storageKey;
        this.wordsMap = new Map(); // word -> { word, meaning, lang, count, firstDiscovered }
        this.loadFromStorage();
    }

    addWord(word, meaning = '', lang = 'kr') {
        if (!word) return;
        const cleanWord = word.trim().toUpperCase();

        if (this.wordsMap.has(cleanWord)) {
            const entry = this.wordsMap.get(cleanWord);
            entry.count += 1;
        } else {
            this.wordsMap.set(cleanWord, {
                word: cleanWord,
                meaning: meaning || `${cleanWord} (초등 단어)`,
                lang: lang,
                count: 1,
                firstDiscovered: new Date().toISOString()
            });
        }
        this.saveToStorage();
        this.updateBadge();
    }

    getWords(filterLang = 'all') {
        const list = Array.from(this.wordsMap.values());
        if (filterLang === 'kr') {
            return list.filter(item => item.lang === 'kr');
        } else if (filterLang === 'en') {
            return list.filter(item => item.lang === 'en');
        }
        return list;
    }

    searchWords(query = '', filterLang = 'all') {
        const cleanQuery = query.trim().toUpperCase();
        const baseList = this.getWords(filterLang);
        if (!cleanQuery) return baseList;

        return baseList.filter(item => 
            item.word.includes(cleanQuery) || item.meaning.includes(cleanQuery)
        );
    }

    renderModal(audioSynth, searchQuery = '', filterLang = 'all') {
        const container = document.getElementById('wordbook-list');
        if (!container) return;

        const items = this.searchWords(searchQuery, filterLang);
        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p style="font-size: 1.2rem; margin-bottom: 8px;">📖 수집된 단어가 없습니다.</p>
                    <p style="font-size: 0.85rem;">게임에서 글자를 조합하여 단어를 완성해보세요!</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'word-card';
            card.innerHTML = `
                <div class="word-card-header">
                    <span class="word-card-title">${item.word}</span>
                    <button class="btn-tts" title="발음 듣기">🔊</button>
                </div>
                <span class="word-card-meaning">${item.meaning}</span>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                    <span>수집 횟수: ${item.count}회</span>
                    <span>${item.lang === 'kr' ? '🇰🇷 한글' : '🇺🇸 영어'}</span>
                </div>
            `;

            const ttsBtn = card.querySelector('.btn-tts');
            if (ttsBtn && audioSynth) {
                ttsBtn.addEventListener('click', () => {
                    audioSynth.speakWord(item.word, item.lang);
                });
            }

            container.appendChild(card);
        });
    }

    updateBadge() {
        const badge = document.getElementById('wordbook-badge');
        if (badge) {
            badge.textContent = this.wordsMap.size;
        }
    }

    saveToStorage() {
        try {
            const data = Array.from(this.wordsMap.entries());
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    loadFromStorage() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const data = JSON.parse(raw);
                this.wordsMap = new Map(data);
            }
        } catch (e) {
            console.warn('LocalStorage load failed:', e);
        }
    }
}
