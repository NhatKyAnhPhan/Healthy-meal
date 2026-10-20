import React, { useState } from 'react';
import { ShoppingItem } from '../types';
import { 
  ShoppingCart, 
  Check, 
  Trash2, 
  Copy, 
  Plus, 
  CheckCircle2, 
  Share2, 
  ListFilter
} from 'lucide-react';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: (name: string, amount: number, unit: string, category: any) => void;
  onClearChecked: () => void;
  onClearAll: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onToggleItem,
  onRemoveItem,
  onAddItem,
  onClearChecked,
  onClearAll,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('phần');
  const [newItemCategory, setNewItemCategory] = useState<any>('vegetable');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'vegetable', label: 'Rau Củ & Quả Tươi', icon: '🥬' },
    { id: 'meat_seafood', label: 'Thịt, Cá & Hải Sản', icon: '🥩' },
    { id: 'grain', label: 'Ngũ Cốc, Bún & Gạo', icon: '🌾' },
    { id: 'seasoning', label: 'Gia Vị & Thảo Mộc', icon: '🧂' },
    { id: 'dairy_egg', label: 'Trứng & Đậu Phụ', icon: '🥚' },
    { id: 'other', label: 'Món Khác', icon: '📦' },
  ];

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName.trim(), Number(newItemAmount) || 1, newItemUnit, newItemCategory);
    setNewItemName('');
  };

  const handleCopyClipboard = () => {
    const lines = items.map((it) => `${it.checked ? '☑' : '☐'} ${it.name}: ${it.amount} ${it.unit} (${it.recipeSource})`);
    const text = `🛒 DANH SÁCH ĐI CHỢ - BẾP SỐNG KHỎE\n\n${lines.join('\n')}\n\nChúc bạn nấu ăn ngon miệng và giàu sức khỏe!`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              Danh Sách Nguyên Liệu Đi Chợ
            </h1>
          </div>
          <p className="text-xs text-stone-500">
            Đã mua {checkedCount}/{items.length} món nguyên liệu
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleCopyClipboard}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Sao chép để gửi Zalo hoặc ghi chú"
              >
                {copyFeedback ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copyFeedback ? 'Đã sao chép!' : 'Sao chép danh sách'}</span>
              </button>

              {checkedCount > 0 && (
                <button
                  type="button"
                  onClick={onClearChecked}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 text-xs font-semibold transition-colors"
                >
                  Xóa món đã mua ({checkedCount})
                </button>
              )}

              <button
                type="button"
                onClick={onClearAll}
                className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Xóa toàn bộ danh sách"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add Custom Item Form */}
      <form onSubmit={handleAddNew} className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 flex flex-wrap items-center gap-2.5 text-xs">
        <span className="font-semibold text-stone-700 shrink-0">Thêm nhanh:</span>
        <input
          type="text"
          placeholder="Tên nguyên liệu (vd: Gừng tươi, Cải thìa...)"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
        />
        <input
          type="number"
          step="any"
          placeholder="SL"
          value={newItemAmount}
          onChange={(e) => setNewItemAmount(e.target.value)}
          className="w-16 px-2.5 py-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-center"
        />
        <input
          type="text"
          placeholder="Đơn vị (g, kg, quả)"
          value={newItemUnit}
          onChange={(e) => setNewItemUnit(e.target.value)}
          className="w-24 px-2.5 py-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value)}
          className="px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm</span>
        </button>
      </form>

      {/* Items by Category */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800 font-serif">
            Danh sách đi chợ đang trống
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Hãy chọn các công thức nấu ăn yêu thích hoặc bấm nút "Gợi Ý Thực Đơn" trong mục Thực Đơn Ngày để tự động gom nguyên liệu vào đây nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat) => {
            const catItems = items.filter((i) => i.category === cat.id);
            if (catItems.length === 0) return null;

            return (
              <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2 font-serif">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-stone-400">
                    {catItems.filter((i) => i.checked).length}/{catItems.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onToggleItem(item.id)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        item.checked
                          ? 'bg-stone-50 border-stone-200 opacity-60'
                          : 'bg-white border-stone-200/90 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          item.checked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}>
                          {item.checked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className={`text-xs font-semibold ${item.checked ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                            {item.name}
                          </span>
                          {item.recipeSource && (
                            <span className="block text-[10px] text-stone-400 truncate max-w-[200px]">
                              {item.recipeSource}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {item.amount} {item.unit}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveItem(item.id);
                          }}
                          className="p-1 text-stone-300 hover:text-rose-500 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
