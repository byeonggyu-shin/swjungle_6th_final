import { DELETE } from "@/axios/DELETE";

type WithdrawalBtnProps = {
  userInfo: any;
};

const WithdrawalBtn: React.FC<WithdrawalBtnProps> = ({ userInfo }) => {
  const handleWithdrawal = async () => {
    try {
      const response = await DELETE("myinfo", true);

      if (response.data.success) {
        localStorage.removeItem("token");
        alert(`${userInfo?.name}님, 탈퇴되었습니다.`);
      }
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  return (
    <button
      className="bg-black text-white font-bold py-2 px-4 rounded mt-2 cursor-pointer"
      onClick={handleWithdrawal}
    >
      탈퇴
    </button>
  );
};

export default WithdrawalBtn;
