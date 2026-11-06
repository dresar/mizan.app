import { Santri } from '@/types';
export const filterSantriData = (
  data: Santri[],
  statusFilter: string,
  genderFilter: string,
  startDate: string,
  endDate: string
) => {
  if (!data) return [];
  return data.filter((santri) => {
    const matchesStatus = statusFilter === 'all' || santri.status === statusFilter;
    const matchesGender = genderFilter === 'all' || santri.jenis_kelamin === genderFilter;
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(santri.created_at) >= new Date(startDate);
    }
    if (endDate) {
       const end = new Date(endDate);
       end.setHours(23, 59, 59, 999);
       matchesDate = matchesDate && new Date(santri.created_at) <= end;
    }
    return matchesStatus && matchesGender && matchesDate;
  });
};