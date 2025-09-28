import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function ProductPage() {
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const search = params.get('search')
    if (search) {
      setSearchTerm(search)
      console.log('Tìm kiếm:', search)
      // TODO: Gọi API tìm kiếm sản phẩm
    }
  }, [location.search])

  return (
    <div className="container py-4">
      <h2>Product Page</h2>
      {searchTerm ? (
        <p>Kết quả tìm kiếm cho: <strong>"{searchTerm}"</strong></p>
      ) : (
        <p>Danh sách sản phẩm.</p>
      )}
    </div>
  );
}








