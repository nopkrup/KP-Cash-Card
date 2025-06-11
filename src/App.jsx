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

  const findBestCombo = (price, maxLeftover = 1500) => {
    let bestCombo = null;
    let bestTotalPaid = Infinity;
    let bestTotalValue = 0;

    const maxCounts = [5, 5, 5, 5, 5, 5];

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

    for (const combo of allCombos) {
      let totalValue = 0;
      let totalPaid = 0;
      let comboDetail = [];

      combo.forEach((count, idx) => {
        if (count > 0) {
          const card = cardOptions[idx];
          totalValue += card.value * count;
          totalPaid += card.price * count;
          comboDetail.push({ ...card, count });
        }
      });

      const leftover = totalValue - price;
      if (totalValue >= price && leftover <= maxLeftover) {
        if (totalPaid < bestTotalPaid) {
          bestTotalPaid = totalPaid;
          bestTotalValue = totalValue;
          bestCombo = comboDetail;
        }
      }
    }

    return {
      cards: bestCombo || [],
      totalValue: bestTotalValue,
      totalPaid: bestTotalPaid,
    };
  };

  const calculate = () => {
    if (price <= 0) return;

    const a = greedyUse(price);
    const cashGap = price - a.totalValue;
    const totalToPay = a.totalPaid + cashGap;
    const discountAmount = price - totalToPay;
    const discountPercent = ((discountAmount / price) * 100).toFixed(2);

    const b = findBestCombo(price);
    const cashGap2 = price - b.totalValue;
    const totalToPay2 = b.totalPaid + cashGap2;
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
      nextBestOptionCards: b.cards,
      totalValue2: b.totalValue,
      totalPaid2: b.totalPaid,
      totalToPay2,
      discountAmount2,
      discountPercent2,
      cashGap2,
      remainingCashCardValue: b.totalValue - price,
    });
  };

  return (
    <div className="min-h-screen bg-blue-900 p-4 text-gray-100">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 text-gray-800">
        <h1 className="text-2xl font-bold text-blue-800 mb-4 text-center">เครื่องคำนวณการซื้อ Cash Card</h1>
        <input
          type="number"
          placeholder="กรอกราคาสินค้า (บาท)"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setPrice(isNaN(value) ? 0 : value);
          }}
          className="mb-4 border border-gray-300 rounded-md px-4 py-2 w-full"
        />
        <button
          onClick={() => {
            if (price > 0) calculate();
          }}
          className="w-full bg-yellow-400 text-blue-900 font-bold hover:bg-yellow-300 py-2 rounded-md"
        >
          คำนวณ
        </button>

        {result && (
          <div>
            {/* ตัวเลือก A */}
            <div className="mt-6 border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h2 className="text-xl font-bold text-blue-800 mb-2">🅰️ ตัวเลือก A: ใช้บัตรเท่าที่จำเป็น</h2>
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

            {/* ตัวเลือก B */}
            <div className="mt-6 border border-blue-300 rounded-lg p-4 bg-blue-100">
              <h2 className="text-xl font-bold text-blue-800 mb-2">🅱️ ตัวเลือก B: ใช้บัตรให้คุ้มค่าที่สุด</h2>
              {result.nextBestOptionCards.length > 0 ? (
                <ul className="list-disc list-inside mb-2">
                  {result.nextBestOptionCards.map((card, idx) => (
                    <li key={idx}>
                      บัตรมูลค่า {card.price.toLocaleString()} บาท × {card.count} ใบ (ได้รับ {card.value.toLocaleString()} บาท/ใบ)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">ไม่พบชุดบัตรที่คุ้มค่าในเงื่อนไขนี้</p>
              )}
              <p>มูลค่า Cash Card รวม: {result.totalValue2.toLocaleString()} บาท</p>
              <p className="mt-2 font-semibold text-blue-800">💳 ชำระเงินครั้งที่ 1: {result.totalPaid2.toLocaleString()} บาท</p>
              <p className="font-semibold text-blue-800">💸 ชำระเงินครั้งที่ 2: {result.cashGap2.toLocaleString()} บาท</p>
              <p className="font-bold text-red-600 text-xl mt-2">💰 รวมลูกค้าต้องจ่ายทั้งหมด: {result.totalToPay2.toLocaleString()} บาท</p>
              <p className="text-green-600 font-bold mt-2">ส่วนลดที่ได้รับ: {result.discountAmount2.toLocaleString()} บาท ({result.discountPercent2}%)</p>
              <p className="text-blue-700 font-semibold">มูลค่า Cash Card คงเหลือ: {result.remainingCashCardValue.toLocaleString()} บาท</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
