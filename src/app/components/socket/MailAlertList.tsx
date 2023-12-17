"use client";
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRecoilState } from 'recoil';
import { mailAlarmState, PostAlertInfo } from '../../recoil/dataRecoil';
import { useRouter } from 'next/navigation';

export function MailAlertList() {
  const [alertInfo, setAlertInfo] = useRecoilState(mailAlarmState);
  const [alertData, setAlertData] = useState<PostAlertInfo[]>([]);
  const router = useRouter()

  const token = Cookies.get('access-token');

  useEffect(() => {
    const token = Cookies.get('access-token');
    const getAlertData = async () => {
      try {
        const response = await axios('https://worldisaster.com/api/emailAlerts', {
          headers: { Authorization: `Bearer ${token}` }
        })
        // console.log("alert sucess", response.data);
        setAlertData(response.data);
      } catch (error) {
        console.log("Log: Alert error", error);
      }
    }
    getAlertData();
  }, [alertInfo]);

  const handleMoveHere = (latitude: number, longitude: number) => {

    // 경도와 위도를 사용하여 URL 생성
    // 예시 URL: /earth?lat=37.7749&lon=-122.4194
    const url = `/earth?lat=${latitude}&lon=${longitude}`;
    router.push(url);
  }

  const deleteHandeler = async (objectId: string, countryName: string) => {

    if (!confirm("Would you like to remove a subscription?"))
      return;

    try {
      const response = await axios.delete(`https://worldisaster.com/api/emailAlerts/${objectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // console.log('Alert deleted successfully', response.data);

      // alertInfo에서 해당 경고를 제거
      setAlertInfo(prev => ({
        ...prev,
        updated: new Date(),
      }));

      // alertData 상태도 업데이트
      setAlertData(prev => prev.filter(alert => alert.objectId !== objectId));
      alert(`You no longer receive alerts from ${countryName}.`);

    } catch (error) {
      // alert("Something went wrong. Please contact our administrators.")
      console.log("error", error);
    }
  };

  return (
    <div className='border-white border-5 divide-gray-300 w-full rounded-xl mt-2 overflow-hidden'>
      <table className='w-full'>
        <thead className="bg-gray-50">
          <tr>
            <th className="pl-2 p-2 text-xs text-gray-500">
              ID
            </th>
            <th className="p-2 text-xs text-gray-500">
              Country
            </th>
            <th className="p-2 text-xs text-gray-500">
              Date Created
            </th>
            <th className="p-2 text-xs text-gray-500"></th>
          </tr>
        </thead>
        <tbody>
          {alertData && alertData.length > 0 ? alertData.map((data, index) => (
            <tr className="whitespace-nowrap text-center" key={index}>
              <td className="p-2 text-sm text-gray-500 pl-3">
                {index + 1}
              </td>
              <td className="p-2 pl-3">
                <button onClick={() => handleMoveHere(data.alertLatitude, data.alertLongitude)}>
                  <div className="text-sm text-gray-900 text-center">
                    {data.alertCountryName}
                  </div>
                </button>
              </td>
              <td className="p-2 text-sm text-gray-500 pl-3">
                {data.createdAt.slice(0, 10)}
              </td>
              <td className="p-2 pl-3 flex justify-center">
                <button className="px-4 py-1 text-sm text-red-400 bg-red-200 rounded-full" onClick={() => deleteHandeler(data.objectId, data.alertCountryName)}>
                  Delete
                </button>
              </td>
            </tr>
          )) :
            <tr>
              <td colSpan={4} className="text-center p-2 text-sm text-gray-500 pl-3">
                No Data
              </td>
            </tr>}
        </tbody>
      </table>
    </div>
  )
}
export default MailAlertList;
