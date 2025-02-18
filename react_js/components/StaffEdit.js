import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function StaffEdit({ onUpdate }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const member_no = searchParams.get('member_no');
  const [isAdmin, setIsAdmin] = useState(false);

  const [staffData, setStaffData] = useState({
    member_id: '',
    member_nick: '',
    member_gender: '',
    member_birth: '',
    member_phone: '',
    member_email: '',
    admins: 0
  });

  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        if (!member_no) {
          throw new Error('직원 번호가 없습니다.');
        }

        // /staff/read 엔드포인트 사용
        const params = new URLSearchParams();
        params.append('member_no', member_no);

        const response = await axios.post('/staff/read', params, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        if (response.data) {
          console.log('서버에서 받은 직원 데이터:', response.data);
          
          const formattedData = {
            ...response.data,
            member_birth: response.data.member_birth ? 
              new Date(response.data.member_birth).toISOString().split('T')[0] : ''
          };
          setStaffData(formattedData);
        } else {
          throw new Error('직원을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('직원 정보를 가져오는데 실패했습니다:', error);
        console.error('에러 상세:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        alert('직원 정보를 불러오는데 실패했습니다.');
        navigate('/staff/list');
      }
    };

    if (member_no) {
      fetchStaffData();
    }
  }, [member_no, navigate]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.post('/staff/check-login', {}, {
          withCredentials: true
        });
        setIsAdmin(response.data.isAdmin || response.data.delete_right_no === 1);
      } catch (error) {
        navigate('/');
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const birthDate = staffData.member_birth ? 
        new Date(staffData.member_birth).toISOString().split('T')[0] : null;

      const staffDto = {
        member_no: parseInt(member_no),
        member_id: staffData.member_id.trim(),
        member_nick: staffData.member_nick,
        member_phone: staffData.member_phone,
        member_email: staffData.member_email,
        member_gender: staffData.member_gender,
        member_birth: birthDate,
        delete_right_no: staffData.delete_right_no || 0,
        position_no: staffData.position_no || 1,
        admins: staffData.admins || 0,
        member_delete: staffData.member_delete || 0,
        points: staffData.points || 0
      };

      if (staffData.member_pw) {
        staffDto.member_pw = staffData.member_pw;
      }

      const response = await axios.post('/staff/edit/', staffDto, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        alert(response.data.message || '직원 정보가 수정되었습니다.');
        if (onUpdate) {
          await onUpdate();
        }
        navigate('/staff/removelist');
      } else {
        throw new Error(response.data.message || '수정에 실패했습니다.');
      }
    } catch (error) {
      alert('직원 정보 수정에 실패했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="edit-form-container">
      <h2>직원 정보 수정</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디</label>
          <input
            type="text"
            name="member_id"
            value={staffData.member_id}
            disabled
            required
          />
        </div>
        <div className="form-group">
          <label>이름</label>
          <input
            type="text"
            name="member_nick"
            value={staffData.member_nick}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>성별</label>
          <select
            name="member_gender"
            value={staffData.member_gender}
            onChange={handleChange}
            required
          >
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </div>
        <div className="form-group">
          <label>생년월일</label>
          <input
            type="date"
            name="member_birth"
            value={staffData.member_birth}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>전화번호</label>
          <input
            type="tel"
            name="member_phone"
            value={staffData.member_phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            name="member_email"
            value={staffData.member_email}
            onChange={handleChange}
            required
          />
        </div>
        {!isAdmin && (
          <div className="form-group">
            <label>현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
        )}
        <div className="button-group">
          <button type="submit">수정</button>
          <button type="button" onClick={() => navigate('/')}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default StaffEdit;