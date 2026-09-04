import React, { useRef } from "react";
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  ClipboardCheck, 
  Clock, 
  BarChart3, 
  Share2, 
  Smartphone,
  Cloud,
  CloudLightning,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  Download,
  Upload
} from "lucide-react";

interface ShareLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
  onCopyTeacherLink: () => void;
  teacherCopied: boolean;
  onCopyDelayLink: () => void;
  delayCopied: boolean;
  onCopyStatsLink: () => void;
  statsCopied: boolean;
  onCopyAdminSyncLink?: () => void;
  adminSyncCopied?: boolean;
  onSyncCloudData?: () => Promise<void>;
  isSyncingCloud?: boolean;
  syncCloudSuccess?: boolean;
  isGoogleAuthenticated?: boolean;
  onGoogleLogin?: () => void;
  onDownloadBackup?: () => void;
  onUploadBackup?: (file: File) => void;
  onOpenCloudDiagnostics?: () => void;
}

export default function ShareLinksModal({
  isOpen,
  onClose,
  schoolName,
  onCopyTeacherLink,
  teacherCopied,
  onCopyDelayLink,
  delayCopied,
  onCopyStatsLink,
  statsCopied,
  onCopyAdminSyncLink,
  adminSyncCopied = false,
  onSyncCloudData,
  isSyncingCloud = false,
  syncCloudSuccess = false,
  isGoogleAuthenticated = false,
  onGoogleLogin,
  onDownloadBackup,
  onUploadBackup,
  onOpenCloudDiagnostics
}: ShareLinksModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-right animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-xs">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black">مشاركة روابط النظام والمزامنة السحابية</h3>
              <p className="text-[11px] text-blue-100 font-medium">
                {schoolName ? `بوابة ${schoolName}` : "روابط سريعة للمشرفين والمعلمين ونقل البيانات بين الأجهزة"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          
          {/* Cloud Sync & Backup Action Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 border-2 border-indigo-200/90 rounded-2xl p-4 space-y-3 shadow-3xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <CloudLightning className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <span>مزامنة البيانات السحابية (Cloud Sync)</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      متصل بالسحابة
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-600 font-bold mt-0.5">
                    رفع وحفظ جميع الفصول والطلاب والغياب لتظهر فوراً على أجهزتك الأخرى
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Button */}
            {onSyncCloudData && (
              <button
                type="button"
                onClick={onSyncCloudData}
                disabled={isSyncingCloud}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-black transition shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-75"
              >
                {isSyncingCloud ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>جاري رفع ومزامنة البيانات مع السحابة...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4 text-white" />
                    <span>⚡ مزامنة ورفع البيانات إلى السحابة فوراً</span>
                  </>
                )}
              </button>
            )}

            {onOpenCloudDiagnostics && (
              <button
                type="button"
                onClick={onOpenCloudDiagnostics}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white text-indigo-900 rounded-xl text-xs font-black transition border border-indigo-200 shadow-3xs cursor-pointer"
              >
                <CloudLightning className="w-3.5 h-3.5 text-amber-500" />
                <span>فحص خصائص وتشخيص قاعدة البيانات السحابية</span>
              </button>
            )}

            {syncCloudSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-3 py-2 text-xs font-black animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تمت المزامنة السحابية بنجاح! جميع بياناتك محفوظة الآن وجاهزة للعرض على أي جهاز.</span>
              </div>
            )}

            {/* Quick JSON Backup Transfer (Offline/Immediate Cross-Device Migration) */}
            <div className="pt-2 border-t border-indigo-200/60 space-y-1.5">
              <p className="text-[11px] font-black text-slate-800">
                💾 النقل السريع للبيانات بين قوقل استوديو وموقع Vercel (ملف JSON):
              </p>
              <div className="flex items-center gap-2">
                {onDownloadBackup && (
                  <button
                    type="button"
                    onClick={onDownloadBackup}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition"
                    title="تنزيل نسخة احتياطية كاملة لبيانات المدرسة"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير نسخة (JSON)</span>
                  </button>
                )}

                {onUploadBackup && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition"
                      title="استيراد نسخة احتياطية سابقة وتثبيتها"
                    >
                      <Upload className="w-4 h-4" />
                      <span>استيراد نسخة (JSON)</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onUploadBackup) onUploadBackup(file);
                        if (e.target) e.target.value = "";
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-700 font-bold leading-relaxed pt-1">
            اختر الرابط المناسب لنسخه ومشاركته عبر WhatsApp أو فتحه على أي جهاز كمبيوتر وجوال:
          </p>

          {/* 0. Admin Full Sync Link (For Opening on Other Devices) */}
          {onCopyAdminSyncLink && (
            <div className="bg-slate-50 border border-slate-300 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-950">رابط لوحة التحكم الكاملة للمدير (مربوط بالسحابة)</h4>
                    <p className="text-[10px] text-slate-600 font-bold">افتحه على جهازك الثاني أو جوالك لفتح نفس بيانات المدرسة فوراً</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onCopyAdminSyncLink}
                className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 rounded-xl text-xs font-black transition shadow-3xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-slate-700" />
                  <span>نسخ رابط لوحة التحكم المربوطة سحابياً</span>
                </div>
                {adminSyncCopied ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-black">
                    <Check className="w-3.5 h-3.5" /> تم النسخ
                  </span>
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>
          )}

          {/* 1. Teachers Attendance Link */}
          <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-purple-950">رابط المعلمين (الغياب والسلوك)</h4>
                  <p className="text-[10px] text-purple-700 font-bold">لرصد حضور الحصص والمخالفات المدرسية</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCopyTeacherLink}
              className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-purple-100/50 border border-purple-300 text-purple-900 rounded-xl text-xs font-black transition shadow-3xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-purple-600" />
                <span>نسخ الرابط المباشر للمعلمين</span>
              </div>
              {teacherCopied ? (
                <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-black">
                  <Check className="w-3.5 h-3.5" /> تم النسخ
                </span>
              ) : (
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          {/* 2. Morning Delay Link */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950">رابط تسجيل التأخر الصباحي</h4>
                  <p className="text-[10px] text-amber-700 font-bold">لمشرفي الطابور والبوابة الصباحية</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCopyDelayLink}
              className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-900 rounded-xl text-xs font-black transition shadow-3xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-amber-600" />
                <span>نسخ الرابط لمشرف التأخر</span>
              </div>
              {delayCopied ? (
                <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-black">
                  <Check className="w-3.5 h-3.5" /> تم النسخ
                </span>
              ) : (
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          {/* 3. Admin / Stats Link */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-950">رابط لوحة المتابعة والإحصائيات</h4>
                  <p className="text-[10px] text-blue-700 font-bold">لمدير المدرسة ووكيل شؤون الطلاب</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCopyStatsLink}
              className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-blue-100/50 border border-blue-300 text-blue-900 rounded-xl text-xs font-black transition shadow-3xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-blue-600" />
                <span>نسخ الرابط المباشر للمسؤول</span>
              </div>
              {statsCopied ? (
                <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-black">
                  <Check className="w-3.5 h-3.5" /> تم النسخ
                </span>
              ) : (
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span>متوافق كلياً مع الجوال والكمبيوتر</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black cursor-pointer transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}

