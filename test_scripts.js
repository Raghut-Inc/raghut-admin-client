// === FLOW 1: Simple Direct Order ===
/*
User: "김치찌개 하나 주세요"
→ Expect: Confirmation with exact item
→ GPT: status: "complete", includes 김치찌개
*/

// === FLOW 2: Multi-item Order with Quantities ===
/*
User: "와규 하나랑 돼지 두 개 주세요"
→ Expect: Proper quantity assignment, merged into single order
→ GPT: status: "complete", items = [{와규, 1}, {돼지순두부, 2}]
*/

// === FLOW 3: Needs Clarification for Type ===
/*
User: "순두부 하나"
→ GPT: status: "need_clarification", asks "어떤 종류의 순두부로 드릴까요?"
User: "돼지로 주세요"
→ GPT: returns complete order with 돼지순두부
*/

// === FLOW 4: Needs Clarification for Brand ===
/*
User: "소주 하나"
→ GPT: status: "need_clarification", asks "어떤 걸로 드릴까요?"
User: "참이슬로요"
→ GPT: status: "complete", item = {소주, brand: 참이슬}
*/

// === FLOW 5: Multiple Brand Clarification ===
/*
User: "소주랑 맥주 하나씩"
→ GPT: status: "need_clarification", asks "소주와 맥주는 어떤 걸로 드릴까요?"
User: "참이슬이랑 테라"
→ GPT: status: "complete", adds both with correct brands
*/

// === FLOW 6: Partial Spiciness Customization ===
/*
User: "와규 순두부 두 개인데 하나 덜 맵게"
→ GPT: two line items, one 기본, one 덜맵게
→ status: "complete"
*/

// === FLOW 7: Off-topic and Recovery ===
/*
User: "화장실이 어디예요?"
→ GPT: status: "off_topic", response: "죄송하지만, 그건 도와드릴 수 없어요."
User: "차돌순두부 하나 주세요"
→ GPT: processes correctly from fresh input
*/

// === FLOW 8: Invalid Menu Item ===
/*
User: "해물파전 하나"
→ GPT: status: "need_clarification", says "해물파전은 메뉴에 없어요"
User: "그럼 김치전 주세요"
→ GPT: adds 김치전 if in menu
*/

// === FLOW 9: Misheard / Silence Recovery ===
/*
User: [mumbles or silence]
→ VAD captures but STT is empty
→ Assistant says: "잘 안 들렸어요. 다시 말씀해 주세요."
User: "와규 순두부 하나"
→ GPT: parses and confirms correctly
*/

// === FLOW 10: Mid-flow Cancel and Restart ===
/*
User: "차돌 하나"
→ GPT: partial confirmation or clarification
User taps "뒤로가기"
→ Expect: VAD stops, session resets, UI returns to greeting
User: "와규 두 개"
→ Fresh flow begins, no double orders
*/

// === FLOW 11: Brand Change Mid-way ===
/*
User: "소주 하나"
→ GPT: asks for brand
User: "참이슬"
→ GPT: confirms
User: "아니 진로로 바꿔 주세요"
→ GPT: status: "complete", item updated
*/

// === FLOW 12: Post-reset Clean Flow ===
/*
User: "순두부 하나"
→ GPT: asks for type
RESET triggered
User: "김치찌개 주세요"
→ GPT: handles as clean new session
*/

// === FLOW 13: “More of the Same” Scenario ===
/*
User: "돼지순두부 하나"
→ Confirmed
User: "그거 하나 더"
→ GPT: correctly adds quantity to existing item
*/

// === FLOW 14: Interleaved Off-topic + Order ===
/*
User: "소주 하나랑 콜라 하나 주세요"
→ GPT: asks for brand
User: "화장실 어디에요?"
→ GPT: status: "off_topic"
User: "참이슬이요"
→ GPT: confirms original 소주 + 콜라 with brands
*/

// === FLOW 15: Clarification Chain Interruption ===
/*
User: "순두부 하나"
→ GPT: asks for type
User: [Silent or unclear]
→ Assistant prompts again
User: "와규요"
→ GPT: completes with 와규순두부
*/

// === FLOW 16: Bulk Complex Order ===
/*
User: "돼지순두부 두 개인데 하나 덜 맵게 하고 소주 하나랑 콜라 하나, 소주 하나 더 그리고 계란말이 하나 그리고 굴순두부 덜맵게"
→ GPT: returns all items, split correctly by spiciness, merged duplicates, brands as needed
*/

// === FLOW 17: After-order Off-topic Behavior ===
/*
User: "콜라 하나"
→ GPT: confirms
User: "화장실 어디예요?"
→ GPT: does not modify order
→ Responds politely
*/

// === FLOW 18: Reorder Previous Items ===
/*
User: "아까 그 와규 다시 하나 더"
→ GPT: recognizes context from previous confirmed order and adds new line correctly
*/

// === FLOW 19: Whispered / low voice ===
/*
User: [low mic input, valid words]
→ STT works
→ GPT gets valid input
→ System does not crash or misfire
*/

// === FLOW 20: Timeout then Retry ===
/*
User: [no speech after wake]
→ VAD times out
→ Assistant says “다시 말씀해 주세요”
→ User: “소주 하나”
→ GPT: continues cleanly
*/
