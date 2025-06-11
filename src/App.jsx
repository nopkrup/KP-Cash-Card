import { useState } from "react";

export default function App() {
  const [price, setPrice] = useState(0);
  const [result, setResult] = useState(null);

  const cardOptions = [
    { price: 100000, value: 130000 },
    { price: 50000, value: 65000 },
    { price: 30000, value: 39000 },
    { price: 20000, value: 26000 },
    { price: 10000, value: 13000 },
    { price: 5000, value: 6500 },
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
    const maxCounts = [maxEach, maxEach, maxEach, maxEach, maxEach, maxEach];
    const allCombos = (function* () {
      function* helper(index, current) {
        if (index === cardOptions.length) {
          yield current;
          return;
        }
        for (let i = 0; i <= maxCounts[index]; i++) {
          yield* helper(index + 1, [...current, i]);
        }
      }
      return helper(0, []);
    })();

    let bestCombo = null;
    let bestOver = Infinity;
    let bestPaid = Infinity;

    for (const combo of allCombos) {
      let value = 0;
      let paid = 0;
      combo.forEach((count, idx) => {
        value += cardOptions[idx].value * count;
        paid += cardOptions[idx].price * count;
      });

      const over = value - price;
      if (value >= price) {
        if (over < bestOver || (over === bestOver && paid < bestPaid)) {
          bestCombo = combo;
          bestOver = over;
          bestPaid = paid;
        }
      }
    }

    if (!bestCombo) {
      return {
        cards: [],
        totalValue: 0,
        totalPaid: 0,
      };
    }

    const cards = bestCombo
      .map((count, idx) =>
        count > 0 ? { ...cardOptions[idx], count } : null
      )
      .filter(Boolean);

    const totalValue = cards.reduce(
      (sum, card) => sum + card.value * card.count,
      0
    );
    const totalPaid = cards.reduce(
      (sum, card) => sum + card.price * card.count,
      0
    );

    return {
      cards,
      totalValue,
      totalPaid,
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
    const hasCombo = b.cards && b.cards.length > 0;
    const totalToPay2 = hasCombo ? b.totalPaid : 0;
    const discountAmount2 = hasCombo ? price - b.totalPaid : 0;
    const discountPercent2 = hasCombo ? ((discountAmount2 / price) * 100).toFixed(2) : 0;
    const leftover = hasCombo ? b.totalValue - price : 0;

    setResult({
      cardsUsed: a.used,
      totalValue: a.totalValue,
      totalPaid: a.totalPaid,
      cashGap,
      totalToPay,
      discountAmount,
      discountPercent,
      nextOptionCards: hasCombo ? b.cards : [],
      totalValue2: hasCombo ? b.totalValue : 0,
      totalPaid2: hasCombo ? b.totalPaid : 0,
      totalToPay2,
      discountAmount2,
      discountPercent2,
      remainingCashCardValue: leftover,
    });
  };

  return (
    <div className="min-h-screen bg-blue-900 p-4 text-gray-100">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 text-gray-800">
        <h1 className="text-2xl font-bold text-blue-800 mb-4 text-center">เครื่องคำนวณการซื้อ Cash Card</h1>
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
            <div className="mt-6 border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h2 className="text-xl font-bold text-blue-800 mb-2">🅰️ ตัวเลือก A: ใช้เท่าที่จำเป็น</h2>
              <ul className="list-disc list-inside mb-2">
                {result.cardsUsed.map((card, idx) => (
                  <li key={idx}>
                    บัตรมูลค่า {card.price.toLocaleString()} บาท × {card.count} ใบ (ได้รับ {card.value.toLocaleString()} บาท/ใบ)
                  </li>
                ))}
              </ul>
              <p>มูลค่า Cash Card รวม: {result.totalValue.toLocaleString()} บาท</p>
              <p className="mt-2 font-semibold text-blue-800">💳 ชำระเงินครั้งที่ 1: {result.totalPaid.toLocaleString()} บาท</p>
              <p className="font-semibold text-blue-800">💸 ชำระเงินครั้งที่ 2: {result.cashGap.toLocaleString()} บาท</p>
              <p className="font-bold text-red-600 text-xl mt-2">💰 รวมลูกค้าต้องจ่ายทั้งหมด: {result.totalToPay.toLocaleString()} บาท</p>
              <p className="text-green-600 font-bold mt-2">ส่วนลดที่ได้รับ: {result.discountAmount.toLocaleString()} บาท ({result.discountPercent}%)</p>
            </div>

            <div className="mt-6 border border-blue-300 rounded-lg p-4 bg-blue-100">
              <h2 className="text-xl font-bold text-blue-800 mb-2">🅱️ ตัวเลือก B: ใช้บัตรให้ใกล้เคียงราคาสินค้าที่สุด</h2>
              {result.nextOptionCards.length > 0 ? (
                <>
                  <ul className="list-disc list-inside mb-2">
                    {result.nextOptionCards.map((card, idx) => (
                      <li key={idx}>
                        บัตรมูลค่า {card.price.toLocaleString()} บาท × {card.count} ใบ (ได้รับ {card.value.toLocaleString()} บาท/ใบ)
                      </li>
                    ))}
                  </ul>
                  <p>มูลค่า Cash Card รวม: {result.totalValue2.toLocaleString()} บาท</p>
                  <p className="mt-2 font-semibold text-blue-800">💳 ชำระเงินครั้งที่ 1: {result.totalPaid2.toLocaleString()} บาท</p>
                  <p className="font-bold text-red-600 text-xl mt-2">💰 รวมลูกค้าต้องจ่ายทั้งหมด: {result.totalToPay2.toLocaleString()} บาท</p>
                  <p className="text-green-600 font-bold mt-2">ส่วนลดที่ได้รับ: {result.discountAmount2.toLocaleString()} บาท ({result.discountPercent2}%)</p>
                  <p className="text-blue-700 font-semibold">มูลค่า Cash Card คงเหลือ: {result.remainingCashCardValue.toLocaleString()} บาท</p>
                </>
              ) : (
                <p className="text-gray-600 italic">ไม่พบชุดบัตรที่เหมาะสมสำหรับราคานี้</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
