export interface Wilaya {
  /** Official code, 1–69 (also used on licence plates). */
  code: number;
  /** Name in French / Latin script. */
  name: string;
  /** Name in Arabic. */
  nameAr: string;
}

// Codes 59–69: created by the 2025 territorial reform (loi n° 26-06, April 2026),
// plate codes in force from 1 January 2027.
export const WILAYAS: readonly Wilaya[] = Object.freeze([
  { code: 1, name: 'Adrar', nameAr: 'أدرار' },
  { code: 2, name: 'Chlef', nameAr: 'الشلف' },
  { code: 3, name: 'Laghouat', nameAr: 'الأغواط' },
  { code: 4, name: 'Oum El Bouaghi', nameAr: 'أم البواقي' },
  { code: 5, name: 'Batna', nameAr: 'باتنة' },
  { code: 6, name: 'Béjaïa', nameAr: 'بجاية' },
  { code: 7, name: 'Biskra', nameAr: 'بسكرة' },
  { code: 8, name: 'Béchar', nameAr: 'بشار' },
  { code: 9, name: 'Blida', nameAr: 'البليدة' },
  { code: 10, name: 'Bouira', nameAr: 'البويرة' },
  { code: 11, name: 'Tamanrasset', nameAr: 'تمنراست' },
  { code: 12, name: 'Tébessa', nameAr: 'تبسة' },
  { code: 13, name: 'Tlemcen', nameAr: 'تلمسان' },
  { code: 14, name: 'Tiaret', nameAr: 'تيارت' },
  { code: 15, name: 'Tizi Ouzou', nameAr: 'تيزي وزو' },
  { code: 16, name: 'Alger', nameAr: 'الجزائر' },
  { code: 17, name: 'Djelfa', nameAr: 'الجلفة' },
  { code: 18, name: 'Jijel', nameAr: 'جيجل' },
  { code: 19, name: 'Sétif', nameAr: 'سطيف' },
  { code: 20, name: 'Saïda', nameAr: 'سعيدة' },
  { code: 21, name: 'Skikda', nameAr: 'سكيكدة' },
  { code: 22, name: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس' },
  { code: 23, name: 'Annaba', nameAr: 'عنابة' },
  { code: 24, name: 'Guelma', nameAr: 'قالمة' },
  { code: 25, name: 'Constantine', nameAr: 'قسنطينة' },
  { code: 26, name: 'Médéa', nameAr: 'المدية' },
  { code: 27, name: 'Mostaganem', nameAr: 'مستغانم' },
  { code: 28, name: "M'Sila", nameAr: 'المسيلة' },
  { code: 29, name: 'Mascara', nameAr: 'معسكر' },
  { code: 30, name: 'Ouargla', nameAr: 'ورقلة' },
  { code: 31, name: 'Oran', nameAr: 'وهران' },
  { code: 32, name: 'El Bayadh', nameAr: 'البيض' },
  { code: 33, name: 'Illizi', nameAr: 'إليزي' },
  { code: 34, name: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج' },
  { code: 35, name: 'Boumerdès', nameAr: 'بومرداس' },
  { code: 36, name: 'El Tarf', nameAr: 'الطارف' },
  { code: 37, name: 'Tindouf', nameAr: 'تندوف' },
  { code: 38, name: 'Tissemsilt', nameAr: 'تيسمسيلت' },
  { code: 39, name: 'El Oued', nameAr: 'الوادي' },
  { code: 40, name: 'Khenchela', nameAr: 'خنشلة' },
  { code: 41, name: 'Souk Ahras', nameAr: 'سوق أهراس' },
  { code: 42, name: 'Tipaza', nameAr: 'تيبازة' },
  { code: 43, name: 'Mila', nameAr: 'ميلة' },
  { code: 44, name: 'Aïn Defla', nameAr: 'عين الدفلى' },
  { code: 45, name: 'Naâma', nameAr: 'النعامة' },
  { code: 46, name: 'Aïn Témouchent', nameAr: 'عين تموشنت' },
  { code: 47, name: 'Ghardaïa', nameAr: 'غرداية' },
  { code: 48, name: 'Relizane', nameAr: 'غليزان' },
  { code: 49, name: 'Timimoun', nameAr: 'تيميمون' },
  { code: 50, name: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار' },
  { code: 51, name: 'Ouled Djellal', nameAr: 'أولاد جلال' },
  { code: 52, name: 'Béni Abbès', nameAr: 'بني عباس' },
  { code: 53, name: 'In Salah', nameAr: 'عين صالح' },
  { code: 54, name: 'In Guezzam', nameAr: 'عين قزام' },
  { code: 55, name: 'Touggourt', nameAr: 'تقرت' },
  { code: 56, name: 'Djanet', nameAr: 'جانت' },
  { code: 57, name: "El M'Ghair", nameAr: 'المغير' },
  { code: 58, name: 'El Menia', nameAr: 'المنيعة' },
  { code: 59, name: 'Aflou', nameAr: 'آفلو' },
  { code: 60, name: 'El Abiodh Sidi Cheikh', nameAr: 'الأبيض سيدي الشيخ' },
  { code: 61, name: 'El Aricha', nameAr: 'العريشة' },
  { code: 62, name: 'El Kantara', nameAr: 'القنطرة' },
  { code: 63, name: 'Barika', nameAr: 'بريكة' },
  { code: 64, name: 'Bou Saâda', nameAr: 'بوسعادة' },
  { code: 65, name: 'Bir El Ater', nameAr: 'بئر العاتر' },
  { code: 66, name: 'Ksar El Boukhari', nameAr: 'قصر البخاري' },
  { code: 67, name: 'Ksar Chellala', nameAr: 'قصر الشلالة' },
  { code: 68, name: 'Aïn Oussara', nameAr: 'عين وسارة' },
  { code: 69, name: 'Messaad', nameAr: 'مسعد' },
]);

/** Look up a wilaya by its official code (1–69). */
export function getWilaya(code: number | string): Wilaya | undefined {
  const n = typeof code === 'string' ? Number.parseInt(code, 10) : code;
  return WILAYAS[n - 1]?.code === n ? WILAYAS[n - 1] : undefined;
}
