import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function ItemEdit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('itemId');
  
  const [item, setItem] = useState({
    item_id: '',
    item_name: '',
    item_price: '',
    item_stock: '',
    item_description: '',
    image_url: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const loadItemData = async () => {
      try {
        console.log('=== 상품 정보 로딩 시작 ===');
        const searchParams = new URLSearchParams(window.location.search);
        const itemId = searchParams.get('itemId');
        
        const editUrl = `${API_BASE_URL}/stuff/item/edit`;
        
        console.log('요청 정보:', {
          itemId,
          url: editUrl,
          params: { itemId },
          withCredentials: true
        });

        const response = await axios.get(editUrl, {
          params: { itemId },
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('서버 응답:', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        });

        if (response.data) {
          console.log('받아온 상품 데이터:', response.data);
          setItem({
            item_id: response.data.item_id || '',
            item_name: response.data.item_name || '',
            item_price: response.data.item_price || '',
            item_stock: response.data.item_stock || '',
            item_description: response.data.item_description || '',
            image_url: response.data.image_url || ''
          });
          if (response.data.image_url) {
            setPreviewUrl(response.data.image_url);
          }
        } else {
          console.error('상품 데이터가 없습니다:', response);
          throw new Error('상품 데이터를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('=== 상품 정보 로딩 오류 상세 ===');
        console.error('오류 타입:', error.name);
        console.error('오류 메시지:', error.message);
        console.error('서버 응답:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        console.error('요청 설정:', {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          headers: error.config?.headers,
          baseURL: API_BASE_URL
        });
        console.error('전체 오류:', error);

        alert('상품 정보를 불러오는데 실패했습니다.');
        navigate('/stuff/item/list');
      } finally {
        console.log('=== 상품 정보 로딩 종료 ===');
      }
    };

    if (itemId) {
      loadItemData();
    }
  }, [itemId, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setItem({...item, image_url: ''});
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setItem({...item, image_url: url});
    setPreviewUrl(url);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = item.image_url;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const imageResponse = await axios.post(
          '/stuff/upload-image',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        finalImageUrl = imageResponse.data.imageUrl;
      }

      const loginResponse = await axios.post(
        '/staff/check-login',
        {
          withCredentials: true
        }
      );

      const params = new URLSearchParams();
      params.append('item_id', itemId);
      params.append('item_name', item.item_name || '');
      params.append('item_price', item.item_price || '');
      params.append('item_stock', item.item_stock || '');
      params.append('item_description', item.item_description || '');
      params.append('image_url', finalImageUrl || '');
      params.append('admin_no', loginResponse.data.admin_no);

      console.log('수정 요청 데이터:', {
        ...params,
        image_url: finalImageUrl
      });

      const response = await axios.post('/stuff/item/edit', params, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data === 'redirect:/stuff/item/list' || response.status === 200) {
        alert('상품이 수정되었습니다.');
        navigate(`/stuff/item/${itemId}`);
      } else {
        throw new Error('수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 수정 오류:', error);
      alert('상품 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="edit-form-container">
      <h2>상품 수정</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이미지 URL</label>
          <input
            type="text"
            name="image_url"
            value={item.image_url || ''}
            onChange={handleImageUrlChange}
            placeholder="이미지 URL을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label>또는 이미지 파일 선택</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        {previewUrl && (
          <div className="image-preview">
            <img 
              src={previewUrl} 
              alt="미리보기" 
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x200?text=이미지+미리보기';
                console.error('이미지 로드 실패:', previewUrl);
              }}
            />
          </div>
        )}
        <div className="form-group">
          <label>상품명</label>
          <input
            type="text"
            name="item_name"
            value={item.item_name || ''}
            onChange={(e) => setItem({...item, item_name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>가격</label>
          <input
            type="number"
            name="item_price"
            value={item.item_price || ''}
            onChange={(e) => setItem({...item, item_price: e.target.value})}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label>재고</label>
          <input
            type="number"
            name="item_stock"
            value={item.item_stock || ''}
            onChange={(e) => setItem({...item, item_stock: e.target.value})}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label>설명</label>
          <textarea
            name="item_description"
            value={item.item_description || ''}
            onChange={(e) => setItem({...item, item_description: e.target.value})}
          />
        </div>
        <div className="button-group">
          <button type="submit">수정</button>
          <button type="button" onClick={() => navigate('/stuff/item/list')}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default ItemEdit; 