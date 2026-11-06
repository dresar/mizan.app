import { useQuery, useMutation } from '@tanstack/react-query';
import { santriService } from '@/services/santri-service';
export const useSantriDashboard = () => {
  return useQuery({
    queryKey: ['santri', 'dashboard'],
    queryFn: santriService.getDashboardData,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
  });
};
export const useSantriRegistrationStatus = () => {
  return useQuery({
    queryKey: ['santri', 'registration-status'],
    queryFn: santriService.getRegistrationStatus,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
  });
};
export const useSantriSchedule = (day?: string) => {
  return useQuery({
    queryKey: ['santri', 'schedule', day],
    queryFn: () => santriService.getSchedule(day),
  });
};
export const useSantriNotifications = () => {
  return useQuery({
    queryKey: ['santri', 'notifications'],
    queryFn: santriService.getNotifications,
  });
};
export const useSubmitRegistration = () => {
  return useMutation({
    mutationFn: santriService.submitRegistration,
  });
};
export const useBankAccounts = () => {
  return useQuery({
    queryKey: ['santri', 'bank-accounts'],
    queryFn: santriService.getBankAccounts,
  });
};
export const useSubmitPayment = () => {
  return useMutation({
    mutationFn: santriService.submitPayment,
  });
};
export const useLastPayment = () => {
  return useQuery({
    queryKey: ['santri', 'last-payment'],
    queryFn: santriService.getLastPayment,
  });
};