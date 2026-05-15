import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { deleteData } from '@/lib/api';

type DeleteVars = { url: string };

const useDelete = <TData = unknown, TError = Error, TVariables = DeleteVars>(
  options?: UseMutationOptions<TData, TError, TVariables>,
) => {
  const { mutationFn, ...rest } = options ?? {};
  return useMutation<TData, TError, TVariables>({
    mutationFn: mutationFn ?? ((vars: TVariables) => deleteData<TData>(vars as DeleteVars)),
    ...rest,
  });
};

export default useDelete;
