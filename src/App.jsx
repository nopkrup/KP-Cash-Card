import { useState } from "react";

export default function App() {
  const [price, setPrice] = useState(0);
  const [result, setResult] = useState(null);

const cardOptions = [
  { price: 70000, value: 100000 },
  { price: 35000, value: 50000 },
  { price: 21000, value: 30000 },
  { price: 7000, value: 10000 },
];

  const greedyUse = (amount) => {
    let remaining = amount;
    const used = [];
    let totalValue = 0;
    let totalPaid = 0;

    for (const card of cardOptions) {
      const count = Math.floor(remaining / card.value);
      if (count > 0) {
        used.push({ ...card, count });
        totalValue += card.value * count;
        totalPaid += card.price * count;
        remaining -= card.value * count;
      }
    }

    return { used, totalValue, totalPaid };
  };

  const findClosestCombo = (price, maxEach = 5) => {
    const allRanges = cardOptions.map(() => Array.from({ length: maxEach + 1 }, (_, i) => i));
    let bestCombo = null;
    let bestOver = Infinity;
    let bestPaid = Infinity;
    let bestCardCount = Infinity;

    const combine = (depth = 0, current = []) => {
      if (depth === cardOptions.length) {
        const totalValue = current.reduce((sum, count, i) => sum + cardOptions[i].value * count, 0);
        const totalPaid = current.reduce((sum, count, i) => sum + cardOptions[i].price * count, 0);
        const cardCount = current.reduce((sum, count) => sum + count, 0);

        if (totalValue >= price) {
          const over = totalValue - price;
          if (
            over < bestOver ||
            (over === bestOver && totalPaid < bestPaid) ||
            (over === bestOver && totalPaid === bestPaid && cardCount < bestCardCount)
          ) {
            bestCombo = [...current];
            bestOver = over;
            bestPaid = totalPaid;
            bestCardCount = cardCount;
          }
        }
        return;
      }

      for (const count of allRanges[depth]) {
        current.push(count);
        combine(depth + 1, current);
        current.pop();
      }
    };

    combine();

    if (!bestCombo) return { cards: [], totalPaid: 0, totalValue: 0, finalTotalPaid: 0, cashLeft: 0 };

    const cards = bestCombo
      .map((count, i) => (count > 0 ? { ...cardOptions[i], count } : null))
      .filter(Boolean);

    const totalValue = cards.reduce((sum, card) => sum + card.value * card.count, 0);
    const totalPaid = cards.reduce((sum, card) => sum + card.price * card.count, 0);

    return {
      cards,
      totalPaid,
      totalValue,
      finalTotalPaid: totalPaid,
      cashLeft: totalValue - price,
    };
  };

  const calculate = () => {
    if (price <= 0) return;

    const a = greedyUse(price);
    const cashGap = price - a.totalValue;
    const totalToPay = a.totalPaid + cashGap;
    const discountAmount = price - totalToPay;
    const discountPercent = ((discountAmount / price) * 100).toFixed(2);

    const b = findClosestCombo(price);
    const totalToPay2 = b.finalTotalPaid;
    const discountAmount2 = price - totalToPay2;
    const discountPercent2 = ((discountAmount2 / price) * 100).toFixed(2);

    setResult({
      cardsUsed: a.used,
      totalValue: a.totalValue,
      totalPaid: a.totalPaid,
      cashGap,
      totalToPay,
      discountAmount,
      discountPercent,
      nextOptionCards: b.cards,
      totalValue2: b.totalValue,
      totalPaid2: b.totalPaid,
      totalToPay2,
      discountAmount2,
      discountPercent2,
      remainingCashCardValue: b.cashLeft,
    });
  };

  return (
    <div className="min-h-screen bg-blue-900 p-4 text-gray-100">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 text-gray-800">
        <h1 className="text-2xl font-bold text-blue-800 mb-4 text-center">Cash Card NEW (ภายในเท่านั้น)</h1>
        <input
          type="number"
          placeholder="กรอกราคาสินค้า (บาท)"
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          className="mb-4 border border-gray-300 rounded-md px-4 py-2 w-full"
        />
        <button
          onClick={calculate}
          className="w-full bg-yellow-400 text-blue-900 font-bold hover:bg-yellow-300 py-2 rounded-md"
        >
          คำนวณ
        </button>

        {result && (
          <div>
            {/* ตัวเลือก A */}
            <div className="mt-6 border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h2 className="text-xl font-bold text-blue-800 mb-2">🅰️ ตัวเลือก A: ใช้หมด</h2>
              <ul className="list-disc list-inside mb-2">
                {result.cardsUsed.map((card, idx) => (
                  <li key={idx}>
                    บัตร {card.price.toLocaleString()} บาท × {card.count} ใบ (ได้รับ {card.value.toLocaleString()} บาท/ใบ)
                  </li>
                ))}
              </ul>
              <p>มูลค่า Cash Card รวม: {result.totalValue.toLocaleString()} บาท</p>
              <p className="mt-2 font-semibold text-blue-800">💳1.ชำระค่า Cash Card: {result.totalPaid.toLocaleString()} บาท</p>
              <p className="font-semibold text-blue-800">💸 2.ชำระเงินส่วนต่าง: {result.cashGap.toLocaleString()} บาท</p>
              <p className="font-bold text-red-600 text-xl mt-2">💰 รวมลูกค้าต้องจ่ายทั้งหมด: {result.totalToPay.toLocaleString()} บาท</p>
              <p className="text-green-600 font-bold mt-2">ส่วนลดที่ได้รับ: {result.discountAmount.toLocaleString()} บาท ({result.discountPercent}%)</p>
            </div>

            {/* ตัวเลือก B */}
            <div className="mt-6 border border-blue-300 rounded-lg p-4 bg-blue-100">
              <h2 className="text-xl font-bold text-blue-800 mb-2">🅱️ ตัวเลือก B: ซื้อเพิ่ม (เงินเหลือ)</h2>
              {result.nextOptionCards.length > 0 ? (
                <>
                  <ul className="list-disc list-inside mb-2">
                    {result.nextOptionCards.map((card, idx) => (
                      <li key={idx}>
                        บัตร {card.price.toLocaleString()} บาท × {card.count} ใบ (ได้รับ {card.value.toLocaleString()} บาท/ใบ)
                      </li>
                    ))}
                  </ul>
                  <p>มูลค่า Cash Card รวม: {result.totalValue2.toLocaleString()} บาท</p>
                  <p className="mt-2 font-semibold text-blue-800">💳 ชำระเงินค่า Cash Card: {result.totalPaid2.toLocaleString()} บาท</p>
                  <p className="font-bold text-red-600 text-xl mt-2">💰 รวมลูกค้าต้องจ่ายทั้งหมด: {result.totalToPay2.toLocaleString()} บาท</p>
                  <p className="text-green-600 font-bold mt-2">ส่วนลดที่ได้รับ : {result.discountAmount2.toLocaleString()} บาท ({result.discountPercent2}%)</p>
                  <p className="text-green-600 font-bold mt-2">ℹ️แท้จริงลูกค้าได้รับ 30%  แต่มีเงินเหลือ *ถ้าส่วนลดติดลบ เกิดจากเงินเพิ่มไม่ถูกใช้ แนะนำตัวเลือก🅰️</p>
                  <p className="text-blue-700 font-semibold">📌 Cash Card คงเหลือ: {result.remainingCashCardValue.toLocaleString()} บาท</p>
                </>
              ) : (
                <p className="text-gray-600 italic">ไม่พบชุดบัตรที่เหมาะสม</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
