// ==========================================================================
// Trinity Draft Helper - Core Logic
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------------------------
    // 1. Application State
    // ----------------------------------------------------------------------
    // Helper function to resolve color for all cards
    function determineCardColor(card) {
        const props = card.properties || {};
        
        // 1. Explicitly defined in properties
        if (props["颜色"] && props["颜色"] !== "无" && props["颜色"] !== "无色") {
            return props["颜色"].trim();
        }
        
        // 2. Check sheet name
        const sheet = card.sheet || "";
        if (sheet.includes("红")) return "红";
        if (sheet.includes("黄")) return "黄";
        if (sheet.includes("蓝")) return "蓝";
        if (sheet.includes("紫")) return "紫";
        
        // 3. For sheets containing both multi-color and colorless
        if (sheet.includes("多色") || sheet.includes("无色")) {
            const req = props["颜色要求"] || "";
            if (req && req !== "——" && req !== "None" && req !== "无") {
                const hasRed = req.includes("红");
                const hasYellow = req.includes("黄");
                const hasBlue = req.includes("蓝");
                const hasPurple = req.includes("紫");
                const count = (hasRed ? 1 : 0) + (hasYellow ? 1 : 0) + (hasBlue ? 1 : 0) + (hasPurple ? 1 : 0);
                if (count > 1) {
                    return "多色";
                } else if (count === 1) {
                    if (hasRed) return "红";
                    if (hasYellow) return "黄";
                    if (hasBlue) return "蓝";
                    if (hasPurple) return "紫";
                }
            }
            return "无色";
        }
        
        // 4. Fallback on image filename
        const img = card.image || "";
        if (img.startsWith("红")) return "红";
        if (img.startsWith("黄")) return "黄";
        if (img.startsWith("蓝")) return "蓝";
        if (img.startsWith("紫")) return "紫";
        if (img.startsWith("多色")) {
            if (img.includes("虚空") || img.includes("Void") || img.includes("void")) {
                return "无色";
            }
            return "多色";
        }
        
        return "无色";
    }

    // Tag all cards with their pool and resolve their color
    CARDS_DATA.blaze.forEach(c => {
        c.pool = "blaze";
        c.properties["颜色"] = determineCardColor(c);
    });
    CARDS_DATA.phantom.forEach(c => {
        c.pool = "phantom";
        c.properties["颜色"] = determineCardColor(c);
    });
    const ALL_CARDS = [...CARDS_DATA.blaze, ...CARDS_DATA.phantom];

    const state = {
        currentTab: "gallery", // 'gallery', 'rulebook'
        currentRulesPage: 1,
        activeFilters: {
            pools: ["blaze", "phantom"], // selected pools
            search: "",
            colors: ["红", "黄", "蓝", "紫", "多色", "无色"], // selected colors (all selected by default)
            rarities: ["EPIC", "LEG", "R", "U", "C"], // selected rarities (all selected by default)
            costs: [], // selected costs (initialized dynamically to "Select All" on load)
            race: "" // selected race
        },
        filteredCards: [],
        currentCardIndex: -1,
        allCostsInPool: [] // cached list of all unique costs in active pools
    };

    // ----------------------------------------------------------------------
    // 2. DOM Elements
    // ----------------------------------------------------------------------
    const body = document.body;
    
    // Nav & Header
    const navTabs = document.querySelectorAll(".nav-tab");
    const sections = document.querySelectorAll(".tab-section");

    // Gallery Filters
    const cardSearchInput = document.getElementById("cardSearchInput");
    const colorBtns = document.querySelectorAll(".color-btn");
    const rarityCheckboxes = document.querySelectorAll('input[name="rarity"]');
    const costFiltersContainer = document.getElementById("costFilters");
    const costSelectAllBtn = document.getElementById("costSelectAllBtn");
    const costSelectNoneBtn = document.getElementById("costSelectNoneBtn");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    
    // Color select controllers
    const colorSelectAllBtn = document.getElementById("colorSelectAllBtn");
    const colorSelectNoneBtn = document.getElementById("colorSelectNoneBtn");
    
    // Rarity select controllers
    const raritySelectAllBtn = document.getElementById("raritySelectAllBtn");
    const raritySelectNoneBtn = document.getElementById("raritySelectNoneBtn");
    
    // Pool Checkboxes
    const poolCheckboxes = document.querySelectorAll('input[name="pool"]');
    
    // Gallery Main
    const cardsGrid = document.getElementById("cardsGrid");
    const resultsCounter = document.getElementById("resultsCounter");
    const noResultsMessage = document.getElementById("noResultsMessage");
    const mobileFilterToggleBtn = document.getElementById("mobileFilterToggleBtn");
    const filtersSidebar = document.getElementById("filtersSidebar");

    // Card Modal
    const cardDetailModal = document.getElementById("cardDetailModal");
    const modalBackdrop = document.getElementById("modalBackdrop");
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modalPrevBtn = document.getElementById("modalPrevBtn");
    const modalNextBtn = document.getElementById("modalNextBtn");
    const modalCardImg = document.getElementById("modalCardImg");
    const modalImgLoader = document.getElementById("modalImgLoader");
    const modalCardNo = document.getElementById("modalCardNo");
    const modalCardName = document.getElementById("modalCardName");
    const modalCardRace = document.getElementById("modalCardRace");
    const modalCardCost = document.getElementById("modalCardCost");
    const modalCardCostReq = document.getElementById("modalCardCostReq");
    const modalCardColor = document.getElementById("modalCardColor");
    const modalCardBP = document.getElementById("modalCardBP");
    const modalCardCrush = document.getElementById("modalCardCrush");
    const modalCardAbilities = document.getElementById("modalCardAbilities");

    // Rulebook
    const ruleSearchInput = document.getElementById("ruleSearchInput");
    const rulePageList = document.getElementById("rulePageList");
    const rulePageImg = document.getElementById("rulePageImg");
    const ruleImgLoader = document.getElementById("ruleImgLoader");
    const currentRulesPageNum = document.getElementById("currentRulesPageNum");
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");

    // Mobile Sidebar Backdrop Overlay
    const sidebarOverlay = document.createElement("div");
    sidebarOverlay.className = "sidebar-overlay";
    document.body.appendChild(sidebarOverlay);

    // ----------------------------------------------------------------------
    // 3. Keyword Formatting Helper
    // ----------------------------------------------------------------------
    function formatCardAbilities(text) {
        if (!text) return "无";
        
        let formatted = text;
        const keywords = [
            /【登场时】/g, /【攻击时】/g, /【破坏时】/g, 
            /【防御时】/g, /【任意】/g, /【常时】/g
        ];
        
        keywords.forEach(kw => {
            formatted = formatted.replace(kw, match => `<span class="text-tag">${match}</span>`);
        });

        // Highlight custom numeric abilities
        formatted = formatted.replace(/〈[^〉]+〉/g, match => `<span class="text-tag" style="color: var(--rarity-epic);">${match}</span>`);
        formatted = formatted.replace(/神罗召唤[^一-龥\s]*/g, match => `<span class="text-tag" style="color: var(--rarity-leg);">${match}</span>`);
        
        return formatted.replace(/\n/g, "<br>");
    }

    // ----------------------------------------------------------------------
    // 4. Populate Dynamic Filter Options (Races & Costs)
    // ----------------------------------------------------------------------
    function populateFilterOptions() {
        const poolData = ALL_CARDS.filter(card => state.activeFilters.pools.includes(card.pool));
        
        // A. Populate Races
        const races = new Set();
        poolData.forEach(card => {
            const raceStr = card.properties["种族"];
            if (raceStr) {
                raceStr.split("/").forEach(r => races.add(r.trim()));
            }
        });
        
        const prevSelectedRace = raceSelect.value;
        raceSelect.innerHTML = '<option value="">全部种族</option>';
        Array.from(races).sort().forEach(race => {
            const opt = document.createElement("option");
            opt.value = race;
            opt.textContent = race;
            raceSelect.appendChild(opt);
        });
        
        if (Array.from(races).includes(prevSelectedRace)) {
            raceSelect.value = prevSelectedRace;
        } else {
            state.activeFilters.race = "";
        }

        // B. Populate Costs (Collect All Unique Costs, filter out NaNs)
        const costSet = new Set();
        let hasMissingCost = false;
        
        poolData.forEach(card => {
            const costVal = card.properties["费用"];
            const parsed = parseInt(costVal);
            if (costVal === undefined || costVal === null || costVal === "" || costVal === "None" || isNaN(parsed)) {
                hasMissingCost = true;
            } else {
                costSet.add(parsed);
            }
        });
        
        // Sort costs: numerical ascending
        const sortedNumCosts = Array.from(costSet).sort((a, b) => a - b);
        
        // Unique costs cache
        const newAllCosts = [];
        if (hasMissingCost) {
            newAllCosts.push("无");
        }
        newAllCosts.push(...sortedNumCosts);
        
        const wasFullySelected = state.allCostsInPool.length === 0 || 
            state.allCostsInPool.every(c => state.activeFilters.costs.includes(c));
            
        state.allCostsInPool = newAllCosts;
        
        if (wasFullySelected || state.activeFilters.costs.length === 0) {
            state.activeFilters.costs = [...state.allCostsInPool];
        } else {
            state.activeFilters.costs = state.activeFilters.costs.filter(c => state.allCostsInPool.includes(c));
        }
        
        // Render cost pills
        renderCostPills();
    }

    function renderCostPills() {
        costFiltersContainer.innerHTML = "";
        
        state.allCostsInPool.forEach(cost => {
            const pill = document.createElement("button");
            pill.className = "cost-pill";
            pill.dataset.cost = cost;
            pill.textContent = cost;
            
            // Check if active
            if (state.activeFilters.costs.includes(cost)) {
                pill.classList.add("active");
            }
            
            pill.addEventListener("click", () => {
                toggleCostFilter(cost, pill);
            });
            costFiltersContainer.appendChild(pill);
        });
    }

    function toggleCostFilter(cost, pillElement) {
        const index = state.activeFilters.costs.indexOf(cost);
        if (index > -1) {
            state.activeFilters.costs.splice(index, 1);
            pillElement.classList.remove("active");
        } else {
            state.activeFilters.costs.push(cost);
            pillElement.classList.add("active");
        }
        filterAndRenderCards();
    }

    // Cost select controllers
    costSelectAllBtn.addEventListener("click", () => {
        state.activeFilters.costs = [...state.allCostsInPool];
        document.querySelectorAll(".cost-pill").forEach(pill => pill.classList.add("active"));
        filterAndRenderCards();
    });

    costSelectNoneBtn.addEventListener("click", () => {
        state.activeFilters.costs = [];
        document.querySelectorAll(".cost-pill").forEach(pill => pill.classList.remove("active"));
        filterAndRenderCards();
    });

    // ----------------------------------------------------------------------
    // 5. Card Filtering & Rendering Grid
    // ----------------------------------------------------------------------
    function filterAndRenderCards() {
        state.filteredCards = ALL_CARDS.filter(card => {
            const props = card.properties;
            
            // Pool filter
            if (!state.activeFilters.pools.includes(card.pool)) {
                return false;
            }
            
            // A. Search keyword filter
            if (state.activeFilters.search) {
                const searchKeyword = state.activeFilters.search.toLowerCase();
                const cardName = card.name.toLowerCase();
                const cardNo = card.id.toLowerCase();
                const race = (props["种族"] || "").toLowerCase();
                const abilities = (props["能力"] || "").toLowerCase();
                const specAbilities = (props["特殊能力"] || "").toLowerCase();
                
                const matchesSearch = cardName.includes(searchKeyword) ||
                                       cardNo.includes(searchKeyword) ||
                                       race.includes(searchKeyword) ||
                                       abilities.includes(searchKeyword) ||
                                       specAbilities.includes(searchKeyword);
                                       
                if (!matchesSearch) return false;
            }
            
            // B. Color filter
            if (state.activeFilters.colors.length > 0) {
                const cardColor = props["颜色"] || "";
                
                let matchesColor = false;
                state.activeFilters.colors.forEach(col => {
                    if (col === "多色" && (cardColor.length > 1 || cardColor.includes("多色"))) {
                        matchesColor = true;
                    } else if (col === "无色" && (cardColor === "无" || cardColor === "无色" || cardColor.includes("无"))) {
                        matchesColor = true;
                    } else if (cardColor === col) {
                        matchesColor = true;
                    }
                });
                if (!matchesColor) return false;
            }
            
            // C. Rarity filter
            if (state.activeFilters.rarities.length > 0) {
                const cardNo = card.id;
                let cardRarity = "";
                if (cardNo.includes("LEG")) cardRarity = "LEG";
                else if (cardNo.includes("EPIC") || cardNo.includes("X")) cardRarity = "EPIC";
                else if (cardNo.includes(" R ")) cardRarity = "R";
                else if (cardNo.includes(" U ")) cardRarity = "U";
                else if (cardNo.includes(" C ")) cardRarity = "C";
                
                const sheet = card.sheet.toLowerCase();
                if (!cardRarity) {
                    if (sheet.includes("leg")) cardRarity = "LEG";
                    else if (sheet.includes("epic") || sheet.includes("x")) cardRarity = "EPIC";
                    else if (sheet.includes("-r")) cardRarity = "R";
                    else if (sheet.includes("-u")) cardRarity = "U";
                    else if (sheet.includes("-c")) cardRarity = "C";
                }
                
                if (!state.activeFilters.rarities.includes(cardRarity)) {
                    return false;
                }
            }
            
            // D. Cost filter
            let cardCost = props["费用"];
            const parsed = parseInt(cardCost);
            if (cardCost === undefined || cardCost === null || cardCost === "" || cardCost === "None" || isNaN(parsed)) {
                cardCost = "无";
            } else {
                cardCost = parsed;
            }
            
            if (!state.activeFilters.costs.includes(cardCost)) {
                return false;
            }
            
            // E. Race filter
            if (state.activeFilters.race) {
                const cardRace = props["种族"] || "";
                if (!cardRace.includes(state.activeFilters.race)) {
                    return false;
                }
            }
            
            return true;
        });

        resultsCounter.textContent = `找到 ${state.filteredCards.length} 张卡牌`;
        renderGrid();
    }

    function renderGrid() {
        cardsGrid.innerHTML = "";
        
        if (state.filteredCards.length === 0) {
            noResultsMessage.style.display = "flex";
            return;
        }
        
        noResultsMessage.style.display = "none";
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.onload = () => {
                        const placeholder = img.nextElementSibling;
                        if (placeholder && placeholder.classList.contains("img-placeholder")) {
                            placeholder.remove();
                        }
                    };
                    observer.unobserve(img);
                }
            });
        });

        state.filteredCards.forEach((card, index) => {
            const props = card.properties;
            const cardEl = document.createElement("div");
            cardEl.className = `card-item pool-${card.pool}`;
            cardEl.dataset.index = index;
            cardEl.dataset.id = card.id;

            // Rarity determine
            let cardRarity = "C";
            const cardNo = card.id;
            if (cardNo.includes("LEG")) cardRarity = "LEG";
            else if (cardNo.includes("EPIC") || cardNo.includes("X")) cardRarity = "EPIC";
            else if (cardNo.includes(" R ")) cardRarity = "R";
            else if (cardNo.includes(" U ")) cardRarity = "U";
            else if (cardNo.includes(" C ")) cardRarity = "C";
            
            const sheet = card.sheet.toLowerCase();
            if (sheet.includes("leg")) cardRarity = "LEG";
            else if (sheet.includes("epic") || sheet.includes("x")) cardRarity = "EPIC";
            else if (sheet.includes("-r")) cardRarity = "R";
            else if (sheet.includes("-u")) cardRarity = "U";
            else if (sheet.includes("-c")) cardRarity = "C";

            // Rarity Badge
            const rarityBadge = document.createElement("div");
            rarityBadge.className = `card-rarity-badge rarity-${cardRarity}`;
            rarityBadge.textContent = cardRarity;
            cardEl.appendChild(rarityBadge);

            // Cost Badge (represent empty/None/NaN as "无")
            const rawCost = props["费用"];
            const parsed = parseInt(rawCost);
            const hasCost = (rawCost !== undefined && rawCost !== null && rawCost !== "" && rawCost !== "None" && !isNaN(parsed));
            const costVal = hasCost ? parsed : "无";
            
            const colorVal = props["颜色"] || "无";
            let costColorHex = "#8e8e93";
            let costBgStyle = "";
            if (colorVal.includes("红")) costColorHex = "var(--color-red)";
            else if (colorVal.includes("黄")) costColorHex = "var(--color-yellow)";
            else if (colorVal.includes("蓝")) costColorHex = "var(--color-blue)";
            else if (colorVal.includes("紫")) costColorHex = "var(--color-purple)";
            else if (colorVal.includes("多色")) {
                costBgStyle = "linear-gradient(135deg, #ff3b30, #ffcc00, #007aff, #af52de)";
            }
            
            const costBadge = document.createElement("div");
            costBadge.className = "card-cost-badge";
            if (costBgStyle) {
                costBadge.style.background = costBgStyle;
            } else {
                costBadge.style.setProperty("--c", costColorHex);
            }
            costBadge.textContent = costVal;
            
            if (costVal === "无") {
                costBadge.style.fontSize = "0.65rem";
                costBadge.style.fontWeight = "600";
            }
            cardEl.appendChild(costBadge);

            // Image Container
            const imgBox = document.createElement("div");
            imgBox.className = "card-img-box";
            
            const cardImg = document.createElement("img");
            cardImg.alt = card.name;
            
            const poolPath = card.pool === "blaze" ? "blaze" : "phantom";
            const imgPath = card.image ? `./assets/images/${poolPath}/${card.image}` : "";
            
            cardImg.dataset.src = imgPath;
            imgBox.appendChild(cardImg);

            const placeholder = document.createElement("div");
            placeholder.className = "img-placeholder";
            placeholder.innerHTML = '<span class="spinner"></span>';
            imgBox.appendChild(placeholder);

            cardEl.appendChild(imgBox);

            // Info Container
            const infoBox = document.createElement("div");
            infoBox.className = "card-info-box";
            
            const cardName = document.createElement("div");
            cardName.className = "card-item-name";
            cardName.textContent = card.name;
            infoBox.appendChild(cardName);

            const cardNum = document.createElement("div");
            cardNum.className = "card-item-no";
            cardNum.textContent = card.id;
            infoBox.appendChild(cardNum);

            const cardPoolBadge = document.createElement("div");
            cardPoolBadge.className = `card-pool-badge pool-${card.pool}`;
            cardPoolBadge.textContent = card.pool === "blaze" ? "🔥 红莲" : "💀 幽冥";
            infoBox.appendChild(cardPoolBadge);

            cardEl.appendChild(infoBox);

            cardEl.addEventListener("click", () => {
                state.currentCardIndex = index;
                showCardDetails();
            });

            cardsGrid.appendChild(cardEl);
            imageObserver.observe(cardImg);
        });
    }

    // ----------------------------------------------------------------------
    // 6. Card Details Modal Logic
    // ----------------------------------------------------------------------
    function showCardDetails() {
        if (state.currentCardIndex < 0 || state.currentCardIndex >= state.filteredCards.length) {
            return;
        }

        const card = state.filteredCards[state.currentCardIndex];
        const props = card.properties;
        const poolPath = card.pool === "blaze" ? "blaze" : "phantom";
        
        // Dynamically set modal colors depending on the pool
        if (card.pool === "blaze") {
            cardDetailModal.style.setProperty("--primary", "#ff2d55");
            cardDetailModal.style.setProperty("--primary-glow", "rgba(255, 45, 85, 0.45)");
        } else {
            cardDetailModal.style.setProperty("--primary", "#a333ff");
            cardDetailModal.style.setProperty("--primary-glow", "rgba(163, 51, 255, 0.45)");
        }

        modalCardImg.style.display = "none";
        modalImgLoader.classList.add("active");

        const imgPath = card.image ? `./assets/images/${poolPath}/${card.image}` : "";
        modalCardImg.src = imgPath;
        modalCardImg.onload = () => {
            modalImgLoader.classList.remove("active");
            modalCardImg.style.display = "block";
        };
        modalCardImg.onerror = () => {
            modalImgLoader.classList.remove("active");
            modalCardImg.src = "";
            modalCardImg.alt = "图片加载失败";
            modalCardImg.style.display = "block";
        };

        modalCardNo.textContent = card.id;
        modalCardName.textContent = card.name;
        modalCardRace.textContent = props["种族"] || "无";
        
        const modalCardPool = document.getElementById("modalCardPool");
        if (modalCardPool) {
            modalCardPool.textContent = card.pool === "blaze" ? "红莲 (Blaze)" : "幽冥 (Phantom)";
        }
        
        // Represent empty/None/NaN cost as "无"
        const rawCost = props["费用"];
        const parsed = parseInt(rawCost);
        const hasCost = (rawCost !== undefined && rawCost !== null && rawCost !== "" && rawCost !== "None" && !isNaN(parsed));
        modalCardCost.textContent = hasCost ? parsed : "无";
        
        modalCardCostReq.textContent = props["颜色要求"] || "无";
        modalCardColor.textContent = props["颜色"] || "无";
        modalCardBP.textContent = props["力量"] || "无";
        modalCardCrush.textContent = props["击碎"] || "无";

        let abilitiesHtml = "";
        
        if (props["能力"]) {
            abilitiesHtml += `<div style="margin-bottom: 1rem;">${formatCardAbilities(props["能力"])}</div>`;
        }
        if (props["特殊能力"]) {
            abilitiesHtml += `<div style="margin-bottom: 1rem;"><strong style="color: var(--primary); display:block; margin-bottom:0.25rem;">特殊能力:</strong> ${formatCardAbilities(props["特殊能力"])}</div>`;
        }
        
        for (const [key, value] of Object.entries(props)) {
            if (["卡名", "编号", "种族", "费用", "颜色要求", "颜色", "力量", "击碎", "能力", "特殊能力"].includes(key)) {
                continue;
            }
            if (value) {
                abilitiesHtml += `<div style="margin-bottom: 1rem;"><strong style="color: #ffd700; display:block; margin-bottom:0.25rem;">${key}:</strong> ${formatCardAbilities(value)}</div>`;
            }
        }

        if (!abilitiesHtml) {
            abilitiesHtml = "<div style='color: var(--text-muted);'>无特殊效果能力。</div>";
        }

        modalCardAbilities.innerHTML = abilitiesHtml;

        modalPrevBtn.style.visibility = state.currentCardIndex > 0 ? "visible" : "hidden";
        modalNextBtn.style.visibility = state.currentCardIndex < state.filteredCards.length - 1 ? "visible" : "hidden";

        cardDetailModal.classList.add("active");
        body.style.overflow = "hidden";
    }

    function closeModal() {
        cardDetailModal.classList.remove("active");
        body.style.overflow = "";
        state.currentCardIndex = -1;
    }

    function nextCard() {
        if (state.currentCardIndex < state.filteredCards.length - 1) {
            state.currentCardIndex++;
            showCardDetails();
        }
    }

    function prevCard() {
        if (state.currentCardIndex > 0) {
            state.currentCardIndex--;
            showCardDetails();
        }
    }

    modalCloseBtn.addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);
    modalPrevBtn.addEventListener("click", prevCard);
    modalNextBtn.addEventListener("click", nextCard);

    document.addEventListener("keydown", (e) => {
        if (!cardDetailModal.classList.contains("active")) return;
        
        if (e.key === "Escape") {
            closeModal();
        } else if (e.key === "ArrowRight") {
            nextCard();
        } else if (e.key === "ArrowLeft") {
            prevCard();
        }
    });

    let touchStartX = 0;
    let touchEndX = 0;

    cardDetailModal.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    cardDetailModal.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 60;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) < threshold) return;
        
        if (diff > 0) {
            prevCard();
        } else {
            nextCard();
        }
    }

    // ----------------------------------------------------------------------
    // 7. Rulebook Reader Logic (Illustrated Image Viewer)
    // ----------------------------------------------------------------------
    function initRulebook() {
        rulePageList.innerHTML = "";
        const pages = RULES_DATA || [];
        
        pages.forEach(p => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.className = "page-item-btn";
            btn.dataset.page = p.page;
            
            let title = `第 ${p.page} 页`;
            if (p.text) {
                const lines = p.text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
                for (let i = 0; i < Math.min(3, lines.length); i++) {
                    const l = lines[i];
                    if (l.match(/^\d+$/) || l.includes("ト Ri に Te ィ") || l.includes("トリニティドラフト") || l.length < 2) {
                        continue;
                    }
                    title = l.substring(0, 16);
                    break;
                }
            }
            
            btn.innerHTML = `<span class="page-title">${title}</span> <span class="page-num">P.${p.page}</span>`;
            li.appendChild(btn);
            
            btn.addEventListener("click", () => {
                state.currentRulesPage = p.page;
                showRulesPage();
            });
            
            rulePageList.appendChild(li);
        });

        state.currentRulesPage = 1;
        showRulesPage();
    }

    const preloadedImages = {};
    function preloadPageImage(pageNum) {
        const totalPages = (RULES_DATA || []).length;
        if (pageNum < 1 || pageNum > totalPages) return;
        if (preloadedImages[pageNum]) return;

        const img = new Image();
        img.src = `./assets/images/rules/page_${pageNum}.jpg`;
        preloadedImages[pageNum] = img;
    }

    // Show illustrated rule page image
    function showRulesPage() {
        const pages = RULES_DATA || [];
        const pageObj = pages.find(p => p.page === state.currentRulesPage);
        
        if (!pageObj) return;

        document.querySelectorAll(".page-item-btn").forEach(btn => {
            btn.classList.remove("active");
            if (parseInt(btn.dataset.page) === state.currentRulesPage) {
                btn.classList.add("active");
                btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        });

        currentRulesPageNum.textContent = state.currentRulesPage;
        
        rulePageImg.style.display = "none";
        ruleImgLoader.classList.add("active");

        const rulesImgPath = `./assets/images/rules/page_${state.currentRulesPage}.jpg`;
        rulePageImg.src = rulesImgPath;
        
        rulePageImg.onload = () => {
            ruleImgLoader.classList.remove("active");
            rulePageImg.style.display = "block";
            
            preloadPageImage(state.currentRulesPage + 1);
            preloadPageImage(state.currentRulesPage + 2);
        };
        rulePageImg.onerror = () => {
            ruleImgLoader.classList.remove("active");
            rulePageImg.src = "";
            rulePageImg.alt = "加载规则页图片失败";
            rulePageImg.style.display = "block";
        };

        prevPageBtn.disabled = state.currentRulesPage <= 1;
        nextPageBtn.disabled = state.currentRulesPage >= pages.length;
    }

    prevPageBtn.addEventListener("click", () => {
        if (state.currentRulesPage > 1) {
            state.currentRulesPage--;
            showRulesPage();
        }
    });

    nextPageBtn.addEventListener("click", () => {
        const pages = RULES_DATA || [];
        if (state.currentRulesPage < pages.length) {
            state.currentRulesPage++;
            showRulesPage();
        }
    });

    ruleSearchInput.addEventListener("input", () => {
        const query = ruleSearchInput.value.trim().toLowerCase();
        const pages = RULES_DATA || [];
        
        document.querySelectorAll(".page-item-btn").forEach(btn => {
            const pageNum = parseInt(btn.dataset.page);
            const pageObj = pages.find(p => p.page === pageNum);
            
            btn.classList.remove("matched");
            const matchCountBadge = btn.querySelector(".match-count");
            if (matchCountBadge) matchCountBadge.remove();

            if (query && pageObj && pageObj.text) {
                const textLower = pageObj.text.toLowerCase();
                
                let count = 0;
                let pos = textLower.indexOf(query);
                while (pos > -1) {
                    count++;
                    pos = textLower.indexOf(query, pos + query.length);
                }
                
                if (count > 0) {
                    btn.classList.add("matched");
                    
                    const badge = document.createElement("span");
                    badge.className = "match-count";
                    badge.textContent = count;
                    btn.appendChild(badge);
                }
            }
        });
    });

    // ----------------------------------------------------------------------
    // 8. Pool & Tab Selectors Logic
    // ----------------------------------------------------------------------
    // Pool Checkboxes filter logic
    poolCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const pool = cb.value;
            if (cb.checked) {
                if (!state.activeFilters.pools.includes(pool)) {
                    state.activeFilters.pools.push(pool);
                }
            } else {
                const index = state.activeFilters.pools.indexOf(pool);
                if (index > -1) {
                    state.activeFilters.pools.splice(index, 1);
                }
            }
            populateFilterOptions();
            filterAndRenderCards();
        });
    });

    // Tab Switch
    navTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            navTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const targetTab = tab.dataset.tab;
            state.currentTab = targetTab;
            
            sections.forEach(sec => {
                sec.classList.remove("active");
                if (sec.id === `section-${targetTab}`) {
                    sec.classList.add("active");
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 9. Mobile Filter Overlay Drawer Controls
    // ----------------------------------------------------------------------
    function toggleMobileSidebar(show) {
        if (show) {
            filtersSidebar.classList.add("active");
            sidebarOverlay.classList.add("active");
            body.style.overflow = "hidden";
        } else {
            filtersSidebar.classList.remove("active");
            sidebarOverlay.classList.remove("active");
            body.style.overflow = "";
        }
    }

    mobileFilterToggleBtn.addEventListener("click", () => toggleMobileSidebar(true));
    sidebarOverlay.addEventListener("click", () => toggleMobileSidebar(false));

    // ----------------------------------------------------------------------
    // 10. Filter Change Event Bindings
    // ----------------------------------------------------------------------
    cardSearchInput.addEventListener("input", () => {
        state.activeFilters.search = cardSearchInput.value.trim();
        filterAndRenderCards();
    });

    colorBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const color = btn.dataset.color;
            const index = state.activeFilters.colors.indexOf(color);
            
            if (index > -1) {
                state.activeFilters.colors.splice(index, 1);
                btn.classList.remove("active");
            } else {
                state.activeFilters.colors.push(color);
                btn.classList.add("active");
            }
            filterAndRenderCards();
        });
    });

    colorSelectAllBtn.addEventListener("click", () => {
        state.activeFilters.colors = ["红", "黄", "蓝", "紫", "多色", "无色"];
        colorBtns.forEach(btn => btn.classList.add("active"));
        filterAndRenderCards();
    });

    colorSelectNoneBtn.addEventListener("click", () => {
        state.activeFilters.colors = [];
        colorBtns.forEach(btn => btn.classList.remove("active"));
        filterAndRenderCards();
    });

    rarityCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const rarity = cb.value;
            const index = state.activeFilters.rarities.indexOf(rarity);
            
            if (cb.checked) {
                if (index === -1) state.activeFilters.rarities.push(rarity);
            } else {
                if (index > -1) state.activeFilters.rarities.splice(index, 1);
            }
            filterAndRenderCards();
        });
    });

    raritySelectAllBtn.addEventListener("click", () => {
        state.activeFilters.rarities = ["EPIC", "LEG", "R", "U", "C"];
        rarityCheckboxes.forEach(cb => cb.checked = true);
        filterAndRenderCards();
    });

    raritySelectNoneBtn.addEventListener("click", () => {
        state.activeFilters.rarities = [];
        rarityCheckboxes.forEach(cb => cb.checked = false);
        filterAndRenderCards();
    });

    raceSelect.addEventListener("change", () => {
        state.activeFilters.race = raceSelect.value;
        filterAndRenderCards();
    });

    clearFiltersBtn.addEventListener("click", () => {
        state.activeFilters = {
            pools: ["blaze", "phantom"], // Reset pool filters to both checked
            search: "",
            colors: ["红", "黄", "蓝", "紫", "多色", "无色"], // Reset to all selected
            rarities: ["EPIC", "LEG", "R", "U", "C"], // Reset to all checked
            costs: [...state.allCostsInPool], // reset to all selected
            race: ""
        };
        
        cardSearchInput.value = "";
        colorBtns.forEach(btn => btn.classList.add("active"));
        rarityCheckboxes.forEach(cb => cb.checked = true);
        raceSelect.value = "";
        
        // Reset pool checkboxes
        poolCheckboxes.forEach(cb => cb.checked = true);
        
        // Reset cost pills to active
        document.querySelectorAll(".cost-pill").forEach(pill => pill.classList.add("active"));
        
        toggleMobileSidebar(false);
        populateFilterOptions();
        filterAndRenderCards();
    });

    // ----------------------------------------------------------------------
    // 11. Initial App Setup
    // ----------------------------------------------------------------------
    // Set color buttons and rarity checkboxes to active on load
    colorBtns.forEach(btn => btn.classList.add("active"));
    rarityCheckboxes.forEach(cb => cb.checked = true);

    populateFilterOptions();
    filterAndRenderCards();
    initRulebook();
});
