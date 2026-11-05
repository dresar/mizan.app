package models

type TahfidzRecord struct {
	ID           string  `json:"id"`
	SantriID     string  `json:"santriId"`
	SantriName   string  `json:"santriName"`
	Gender       string  `json:"gender"`
	SurahName    string  `json:"surahName"`
	AyatStart    int     `json:"ayatStart"`
	AyatEnd      int     `json:"ayatEnd"`
	Halaman      float64 `json:"halaman"`
	Juz          int     `json:"juz"`
	Predikat     string  `json:"predikat"`
	TargetJuz    int     `json:"targetJuz"`
	RealisasiJuz float64 `json:"realisasiJuz"`
	CatatanUstadz string `json:"catatanUstadz"`
	UstadzID     string  `json:"ustadzId"`
	UstadzName   string  `json:"ustadzName"`
	Date         string  `json:"date"`
	CreatedAt    string  `json:"createdAt"`
}

type KesehatanRecord struct {
	ID          string `json:"id"`
	SantriID    string `json:"santriId"`
	SantriName  string `json:"santriName"`
	Gender      string `json:"gender"`
	Tanggal     string `json:"tanggal"`
	Keluhan     string `json:"keluhan"`
	Diagnosa    string `json:"diagnosa"`
	TindakanObat string `json:"tindakanObat"`
	StatusRawat string `json:"statusRawat"`
	PetugasNama string `json:"petugasNama"`
	Catatan     string `json:"catatan"`
	CreatedAt   string `json:"createdAt"`
}

type PerizinanRecord struct {
	ID              string  `json:"id"`
	SantriID        string  `json:"santriId"`
	SantriName      string  `json:"santriName"`
	SantriClass     string  `json:"santriClass"`
	Gender          string  `json:"gender"`
	JenisIzin       string  `json:"jenisIzin"`
	Alasan          string  `json:"alasan"`
	TglKeluar       string  `json:"tglKeluar"`
	TglKembali      string  `json:"tglKembali"`
	Status          string  `json:"status"`
	DiajukanOleh    string  `json:"diajukanOleh"`
	DisetujuiOleh   string  `json:"disetujuiOleh,omitempty"`
	QRCodeToken     string  `json:"qrCodeToken"`
	BuktiSuratURL   string  `json:"buktiSuratUrl,omitempty"`
	WaktuKeluarRiil *string `json:"waktuKeluarRiil,omitempty"`
	WaktuKembaliRiil *string `json:"waktuKembaliRiil,omitempty"`
	PetugasGerbang  string  `json:"petugasGerbang,omitempty"`
	CreatedAt       string  `json:"createdAt"`
}

type SambanganRecord struct {
	ID               string `json:"id"`
	SantriID         string `json:"santriId"`
	SantriName       string `json:"santriName"`
	Gender           string `json:"gender"`
	WaliName         string `json:"waliName"`
	TanggalSambang   string `json:"tanggalSambang"`
	SesiWaktu        string `json:"sesiWaktu"`
	JumlahPengunjung int    `json:"jumlahPengunjung"`
	Status           string `json:"status"`
	Catatan          string `json:"catatan,omitempty"`
	CreatedAt        string `json:"createdAt"`
}

type TransaksiKeuangan struct {
	ID               string  `json:"id"`
	SantriID         string  `json:"santriId"`
	SantriName       string  `json:"santriName"`
	Gender           string  `json:"gender"`
	Kategori         string  `json:"kategori"`
	Jenis            string  `json:"jenis"`
	Nominal          float64 `json:"nominal"`
	SaldoTerakhir    float64 `json:"saldoTerakhir"`
	Deskripsi        string  `json:"deskripsi"`
	MetodePembayaran string  `json:"metodePembayaran"`
	ReferensiKode    string  `json:"referensiKode,omitempty"`
	PetugasID        string  `json:"petugasId,omitempty"`
	PetugasNama      string  `json:"petugasNama,omitempty"`
	Tanggal          string  `json:"tanggal"`
	Status           string  `json:"status"`
	CreatedAt        string  `json:"createdAt"`
}

type TagihanSPP struct {
	ID            string  `json:"id"`
	SantriID      string  `json:"santriId"`
	SantriName    string  `json:"santriName"`
	Gender        string  `json:"gender"`
	Bulan         string  `json:"bulan"`
	Tahun         int     `json:"tahun"`
	Nominal       float64 `json:"nominal"`
	Status        string  `json:"status"`
	JatuhTempo    string  `json:"jatuhTempo"`
	TglBayar      string  `json:"tglBayar,omitempty"`
	KuitansiNomor string  `json:"kuitansiNomor,omitempty"`
	CreatedAt     string  `json:"createdAt"`
}

type CatatanMusyrif struct {
	ID                   string `json:"id"`
	SantriID             string `json:"santriId"`
	SantriName           string `json:"santriName"`
	Gender               string `json:"gender"`
	MusyrifID            string `json:"musyrifId"`
	MusyrifName          string `json:"musyrifName"`
	Periode              string `json:"periode"`
	AdabSosialSkor       string `json:"adabSosialSkor"`
	KemandirianSkor      string `json:"kemandirianSkor"`
	KebersihanKamarSkor  string `json:"kebersihanKamarSkor"`
	CatatanPerkembangan  string `json:"catatanPerkembangan"`
	RekomendasiUntukWali string `json:"rekomendasiUntukWali,omitempty"`
	CreatedAt            string `json:"createdAt"`
}

type VerifyPassRequest struct {
	Token  string `json:"token"`
	Action string `json:"action"`
}
