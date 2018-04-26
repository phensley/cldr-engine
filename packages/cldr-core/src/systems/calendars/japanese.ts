import { CalendarDate, CalendarDateFields, CalendarType } from './calendar';
import { DateField } from './fields';
import { GregorianDate } from './gregorian';

/**
 * A date in the Japanese Imperial calendar.
 *
 * type: japanese
 */
export class JapaneseDate extends GregorianDate {

  private constructor(firstDay: number, minDays: number) {
    super('japanese', firstDay, minDays);
  }

  add(fields: CalendarDateFields): JapaneseDate {
    const zoneId = fields.zoneId || this.timeZoneId();
    const [jd, ms] = this._add(fields);
    return new JapaneseDate(this._firstDay, this._minDays).initFromJD(jd, ms, zoneId);
  }

  toString(): string {
    return this._toString('Japanese', `${this.extendedYear()}`);
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): JapaneseDate {
    return new JapaneseDate(firstDay, minDays).initFromUnixEpoch(epoch, zoneId);
  }

  protected initFromUnixEpoch(epoch: number, zoneId: string): JapaneseDate {
    super.initFromUnixEpoch(epoch, zoneId);
    computeJapaneseFields(this._fields);
    return this;
  }

  protected initFromJD(jd: number, msDay: number, zoneId: string): JapaneseDate {
    super.initFromJD(jd, msDay, zoneId);
    computeJapaneseFields(this._fields);
    return this;
  }
}

const computeJapaneseFields = (f: number[]): void => {
  const year = f[DateField.EXTENDED_YEAR];
  const len = ERAS.length;
  const end = (len / 3) | 0;
  let low = 0;
  if (year > ERAS[len - 3]) {
    low = end - 1;
  } else {
    let high = end;
    while (low < high - 1) {
      const i = ((low + high) / 2) | 0;
      const j = i * 3;
      let diff = year - ERAS[j];
      if (diff === 0) {
        diff = (f[DateField.MONTH] - 1) - (ERAS[j + 1] - 1);
        if (diff === 0) {
          diff = f[DateField.DAY_OF_MONTH] - ERAS[j + 2];
        }
      }
      if (diff >= 0) {
        low = i;
      } else {
        high = i;
      }
    }
  }
  f[DateField.ERA] = low;
  f[DateField.YEAR] = year - ERAS[low * 3] + 1;
};

const ERAS: number[] = [
    645,    6, 19,     // Taika
    650,    2, 15,     // Hakuchi
    672,    1,  1,     // Hakuho
    686,    7, 20,     // Shucho
    701,    3, 21,     // Taiho
    704,    5, 10,     // Keiun
    708,    1, 11,     // Wado
    715,    9,  2,     // Reiki
    717,   11, 17,     // Yoro
    724,    2,  4,     // Jinki
    729,    8,  5,     // Tempyo
    749,    4, 14,     // Tempyo-kampo
    749,    7,  2,     // Tempyo-shoho
    757,    8, 18,     // Tempyo-hoji
    765,    1,  7,     // Tempho-jingo
    767,    8, 16,     // Jingo-keiun
    770,   10,  1,     // Hoki
    781,    1,  1,     // Ten-o
    782,    8, 19,     // Enryaku
    806,    5, 18,     // Daido
    810,    9, 19,     // Konin
    824,    1,  5,     // Tencho
    834,    1,  3,     // Showa
    848,    6, 13,     // Kajo
    851,    4, 28,     // Ninju
    854,   11, 30,     // Saiko
    857,    2, 21,     // Tennan
    859,    4, 15,     // Jogan
    877,    4, 16,     // Genkei
    885,    2, 21,     // Ninna
    889,    4, 27,     // Kampyo
    898,    4, 26,     // Shotai
    901,    7, 15,     // Engi
    923,    4, 11,     // Encho
    931,    4, 26,     // Shohei
    938,    5, 22,     // Tengyo
    947,    4, 22,     // Tenryaku
    957,   10, 27,     // Tentoku
    961,    2, 16,     // Owa
    964,    7, 10,     // Koho
    968,    8, 13,     // Anna
    970,    3, 25,     // Tenroku
    973,   12, 20,     // Ten-en
    976,    7, 13,     // Jogen
    978,   11, 29,     // Tengen
    983,    4, 15,     // Eikan
    985,    4, 27,     // Kanna
    987,    4,  5,     // Ei-en
    989,    8,  8,     // Eiso
    990,   11,  7,     // Shoryaku
    995,    2, 22,     // Chotoku
    999,    1, 13,     // Choho
  1004,    7, 20,     // Kanko
  1012,   12, 25,     // Chowa
  1017,    4, 23,     // Kannin
  1021,    2,  2,     // Jian
  1024,    7, 13,     // Manju
  1028,    7, 25,     // Chogen
  1037,    4, 21,     // Choryaku
  1040,   11, 10,     // Chokyu
  1044,   11, 24,     // Kantoku
  1046,    4, 14,     // Eisho
  1053,    1, 11,     // Tengi
  1058,    8, 29,     // Kohei
  1065,    8,  2,     // Jiryaku
  1069,    4, 13,     // Enkyu
  1074,    8, 23,     // Shoho
  1077,   11, 17,     // Shoryaku
  1081,    2, 10,     // Eiho
  1084,    2,  7,     // Otoku
  1087,    4,  7,     // Kanji
  1094,   12, 15,     // Kaho
  1096,   12, 17,     // Eicho
  1097,   11, 21,     // Shotoku
  1099,    8, 28,     // Kowa
  1104,    2, 10,     // Choji
  1106,    4,  9,     // Kasho
  1108,    8,  3,     // Tennin
  1110,    7, 13,     // Ten-ei
  1113,    7, 13,     // Eikyu
  1118,    4,  3,     // Gen-ei
  1120,    4, 10,     // Hoan
  1124,    4,  3,     // Tenji
  1126,    1, 22,     // Daiji
  1131,    1, 29,     // Tensho
  1132,    8, 11,     // Chosho
  1135,    4, 27,     // Hoen
  1141,    7, 10,     // Eiji
  1142,    4, 28,     // Koji
  1144,    2, 23,     // Tenyo
  1145,    7, 22,     // Kyuan
  1151,    1, 26,     // Ninpei
  1154,   10, 28,     // Kyuju
  1156,    4, 27,     // Hogen
  1159,    4, 20,     // Heiji
  1160,    1, 10,     // Eiryaku
  1161,    9,  4,     // Oho
  1163,    3, 29,     // Chokan
  1165,    6,  5,     // Eiman
  1166,    8, 27,     // Nin-an
  1169,    4,  8,     // Kao
  1171,    4, 21,     // Shoan
  1175,    7, 28,     // Angen
  1177,    8,  4,     // Jisho
  1181,    7, 14,     // Yowa
  1182,    5, 27,     // Juei
  1184,    4, 16,     // Genryuku
  1185,    8, 14,     // Bunji
  1190,    4, 11,     // Kenkyu
  1199,    4, 27,     // Shoji
  1201,    2, 13,     // Kennin
  1204,    2, 20,     // Genkyu
  1206,    4, 27,     // Ken-ei
  1207,   10, 25,     // Shogen
  1211,    3,  9,     // Kenryaku
  1213,   12,  6,     // Kenpo
  1219,    4, 12,     // Shokyu
  1222,    4, 13,     // Joo
  1224,   11, 20,     // Gennin
  1225,    4, 20,     // Karoku
  1227,   12, 10,     // Antei
  1229,    3,  5,     // Kanki
  1232,    4,  2,     // Joei
  1233,    4, 15,     // Tempuku
  1234,   11,  5,     // Bunryaku
  1235,    9, 19,     // Katei
  1238,   11, 23,     // Ryakunin
  1239,    2,  7,     // En-o
  1240,    7, 16,     // Ninji
  1243,    2, 26,     // Kangen
  1247,    2, 28,     // Hoji
  1249,    3, 18,     // Kencho
  1256,   10,  5,     // Kogen
  1257,    3, 14,     // Shoka
  1259,    3, 26,     // Shogen
  1260,    4, 13,     // Bun-o
  1261,    2, 20,     // Kocho
  1264,    2, 28,     // Bun-ei
  1275,    4, 25,     // Kenji
  1278,    2, 29,     // Koan
  1288,    4, 28,     // Shoo
  1293,    8, 55,     // Einin
  1299,    4, 25,     // Shoan
  1302,   11, 21,     // Kengen
  1303,    8,  5,     // Kagen
  1306,   12, 14,     // Tokuji
  1308,   10,  9,     // Enkei
  1311,    4, 28,     // Ocho
  1312,    3, 20,     // Showa
  1317,    2,  3,     // Bunpo
  1319,    4, 28,     // Geno
  1321,    2, 23,     // Genkyo
  1324,   12,  9,     // Shochu
  1326,    4, 26,     // Kareki
  1329,    8, 29,     // Gentoku
  1331,    8,  9,     // Genko
  1334,    1, 29,     // Kemmu
  1336,    2, 29,     // Engen
  1340,    4, 28,     // Kokoku
  1346,   12,  8,     // Shohei
  1370,    7, 24,     // Kentoku
  1372,    4,  1,     // Bunch\u0169
  1375,    5, 27,     // Tenju
  1379,    3, 22,     // Koryaku
  1381,    2, 10,     // Kowa
  1384,    4, 28,     // Gench\u0169
  1384,    2, 27,     // Meitoku
  1387,    8, 23,     // Kakei
  1389,    2,  9,     // Koo
  1390,    3, 26,     // Meitoku
  1394,    7,  5,     // Oei
  1428,    4, 27,     // Shocho
  1429,    9,  5,     // Eikyo
  1441,    2, 17,     // Kakitsu
  1444,    2,  5,     // Bun-an
  1449,    7, 28,     // Hotoku
  1452,    7, 25,     // Kyotoku
  1455,    7, 25,     // Kosho
  1457,    9, 28,     // Choroku
  1460,   12, 21,     // Kansho
  1466,    2, 28,     // Bunsho
  1467,    3,  3,     // Onin
  1469,    4, 28,     // Bunmei
  1487,    7, 29,     // Chokyo
  1489,    8, 21,     // Entoku
  1492,    7, 19,     // Meio
  1501,    2, 29,     // Bunki
  1504,    2, 30,     // Eisho
  1521,    8, 23,     // Taiei
  1528,    8, 20,     // Kyoroku
  1532,    7, 29,     // Tenmon
  1555,   10, 23,     // Koji
  1558,    2, 28,     // Eiroku
  1570,    4, 23,     // Genki
  1573,    7, 28,     // Tensho
  1592,   12,  8,     // Bunroku
  1596,   10, 27,     // Keicho
  1615,    7, 13,     // Genwa
  1624,    2, 30,     // Kan-ei
  1644,   12, 16,     // Shoho
  1648,    2, 15,     // Keian
  1652,    9, 18,     // Shoo
  1655,    4, 13,     // Meiryaku
  1658,    7, 23,     // Manji
  1661,    4, 25,     // Kanbun
  1673,    9, 21,     // Enpo
  1681,    9, 29,     // Tenwa
  1684,    2, 21,     // Jokyo
  1688,    9, 30,     // Genroku
  1704,    3, 13,     // Hoei
  1711,    4, 25,     // Shotoku
  1716,    6, 22,     // Kyoho
  1736,    4, 28,     // Genbun
  1741,    2, 27,     // Kanpo
  1744,    2, 21,     // Enkyo
  1748,    7, 12,     // Kan-en
  1751,   10, 27,     // Horyaku
  1764,    6,  2,     // Meiwa
  1772,   11, 16,     // An-ei
  1781,    4,  2,     // Tenmei
  1789,    1, 25,     // Kansei
  1801,    2,  5,     // Kyowa
  1804,    2, 11,     // Bunka
  1818,    4, 22,     // Bunsei
  1830,   12, 10,     // Tenpo
  1844,   12,  2,     // Koka
  1848,    2, 28,     // Kaei
  1854,   11, 27,     // Ansei
  1860,    3, 18,     // Man-en
  1861,    2, 19,     // Bunkyu
  1864,    2, 20,     // Genji
  1865,    4,  7,     // Keio
  1868,    9,  8,     // Meiji
  1912,    7, 30,     // Taisho
  1926,   12, 25,     // Showa
  1989,    1,  8,     // Heisei
];
