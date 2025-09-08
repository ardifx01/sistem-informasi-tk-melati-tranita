const API_BASE = "/api";

import {
  type Siswa,
  type CreateSiswaRequest,
  type UpdateSiswaRequest,
  type Kelas,
  type Tagihan,
  type CreateTagihanRequest,
  type Pemasukan,
  type CreatePemasukanRequest,
  type Pengeluaran,
  type CreatePengeluaranRequest,
  LoginResponse,
  Kategori,
  CreateKategoriRequest,
  UpdateKategoriRequest,
} from "@/lib/types";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 204) {
    return Promise.resolve(undefined as T);
  }

  const data = await response.json();

  if (!response.ok) {
    // Buat error yang menyertakan detail dari server
    const error: any = new Error(data.error || "Terjadi kesalahan pada API.");
    error.response = {
      status: response.status,
      data: data,
    };
    throw error;
  }

  return data as T;
}

// API functions
export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Pastikan fungsi ini mengembalikan Promise dengan tipe LoginResponse
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    return fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  //fitur search
  searchSiswa: async (query: string): Promise<Siswa[]> => {
    return fetchAPI(`/siswa/search?q=${query}`);
  },

  // Siswa
  getSiswa: async (): Promise<Siswa[]> => {
    return fetchAPI("/siswa");
  },

  getSiswaById: async (id: string): Promise<Siswa> => {
    return fetchAPI(`/siswa/${id}`);
  },

  getSiswaByKelas: async (
    kelasId: string
  ): Promise<{ id: string; jumlahSpp: number }[]> =>
    fetchAPI(`/siswa/kelas/${kelasId}`),

  createSiswa: async (siswa: CreateSiswaRequest): Promise<Siswa> => {
    return fetchAPI("/siswa", {
      method: "POST",
      body: JSON.stringify(siswa),
    });
  },

  updateSiswa: async (
    id: string,
    siswa: UpdateSiswaRequest
  ): Promise<Siswa> => {
    return fetchAPI(`/siswa/${id}`, {
      method: "PUT",
      body: JSON.stringify(siswa),
    });
  },

  deleteSiswa: async (id: string): Promise<void> => {
    return fetchAPI(`/siswa/${id}`, {
      method: "DELETE",
    });
  },

  // Kelas
  getKelas: async (): Promise<Kelas[]> => {
    return fetchAPI("/kelas");
  },

  getKelasById: async (id: string): Promise<Kelas> => {
    return fetchAPI(`/kelas/${id}`);
  },

  createKelas: async (
    kelas: Omit<Kelas, "id" | "createdAt" | "updatedAt">
  ): Promise<Kelas> => {
    return fetchAPI("/kelas", {
      method: "POST",
      body: JSON.stringify(kelas),
    });
  },

  updateKelas: async (id: string, kelas: Partial<Kelas>): Promise<Kelas> => {
    return fetchAPI(`/kelas/${id}`, {
      method: "PUT",
      body: JSON.stringify(kelas),
    });
  },

  deleteKelas: async (id: string): Promise<void> => {
    return fetchAPI(`/kelas/${id}`, {
      method: "DELETE",
    });
  },

  //tagihan
  getTagihan: async (): Promise<Tagihan[]> => {
    return fetchAPI("/keuangan/tagihan");
  },

  // Mengambil satu tagihan spesifik berdasarkan ID
  getTagihanById: async (id: string): Promise<Tagihan> => {
    return fetchAPI(`/keuangan/tagihan/${id}`);
  },

  createTagihan: async (
    tagihan: CreateTagihanRequest | CreateTagihanRequest[]
  ): Promise<Tagihan | { count: number }> => {
    return fetchAPI("/keuangan/tagihan", {
      method: "POST",
      body: JSON.stringify(tagihan),
    });
  },

  // Memperbarui tagihan, misalnya mengubah status menjadi LUNAS
  updateTagihan: async (
    id: string,
    tagihan: Partial<Tagihan>
  ): Promise<Tagihan> => {
    return fetchAPI(`/keuangan/tagihan/${id}`, {
      method: "PUT",
      body: JSON.stringify(tagihan),
    });
  },

  // Menghapus tagihan
  deleteTagihan: async (id: string): Promise<void> => {
    return fetchAPI(`/keuangan/tagihan/${id}`, {
      method: "DELETE",
    });
  },

  // pemasukan
  getPemasukan: async (): Promise<Pemasukan[]> => {
    return fetchAPI("/keuangan/pemasukan");
  },

  getLaporanPemasukan: async (): Promise<Pemasukan[]> => {
    return fetchAPI("/keuangan/pemasukan/laporan");
  },

  getPemasukanById: async (id: string): Promise<Pemasukan> => {
    return fetchAPI(`/keuangan/pemasukan/${id}`);
  },

  createPemasukan: async (
    pemasukan: CreatePemasukanRequest
  ): Promise<Pemasukan> => {
    return fetchAPI("/keuangan/pemasukan", {
      method: "POST",
      body: JSON.stringify(pemasukan),
    });
  },

  updatePemasukan: async (
    id: string,
    pemasukan: Partial<Pemasukan>
  ): Promise<Pemasukan> => {
    return fetchAPI(`/keuangan/pemasukan/${id}`, {
      method: "PUT",
      body: JSON.stringify(pemasukan),
    });
  },

  deletePemasukan: async (id: string): Promise<void> => {
    return fetchAPI(`/keuangan/pemasukan/${id}`, {
      method: "DELETE",
    });
  },

  //pengeluaran
  getPengeluaran: async (): Promise<Pengeluaran[]> => {
    return fetchAPI("/keuangan/pengeluaran");
  },

  getPengeluaranById: async (id: string): Promise<Pengeluaran> => {
    return fetchAPI(`/keuangan/pengeluaran/${id}`);
  },

  createPengeluaran: async (
    pengeluaran: CreatePengeluaranRequest
  ): Promise<Pengeluaran> => {
    return fetchAPI("/keuangan/pengeluaran", {
      method: "POST",
      body: JSON.stringify(pengeluaran),
    });
  },

  updatePengeluaran: async (
    id: string,
    pengeluaran: Partial<Pengeluaran>
  ): Promise<Pemasukan> => {
    return fetchAPI(`/keuangan/pengeluaran/${id}`, {
      method: "PUT",
      body: JSON.stringify(pengeluaran),
    });
  },

  deletePengeluaran: async (id: string): Promise<void> => {
    return fetchAPI(`/keuangan/pengeluaran/${id}`, {
      method: "DELETE",
    });
  },

  // kategori
  getKategori: async (
    tipe?: "PEMASUKAN" | "PENGELUARAN"
  ): Promise<Kategori[]> => {
    const endpoint = tipe ? `/kategori?tipe=${tipe}` : "/kategori";
    return fetchAPI(endpoint);
  },

  createKategori: async (data: CreateKategoriRequest): Promise<Kategori> => {
    return fetchAPI("/kategori", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Memperbarui nama kategori berdasarkan ID.
   */
  updateKategori: async (
    id: string,
    data: UpdateKategoriRequest
  ): Promise<Kategori> => {
    return fetchAPI(`/kategori/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Menghapus kategori berdasarkan ID.
   */
  deleteKategori: async (id: string): Promise<void> => {
    return fetchAPI(`/kategori/${id}`, {
      method: "DELETE",
    });
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<any> => {
    return fetchAPI("/dashboard/stats");
  },
};
