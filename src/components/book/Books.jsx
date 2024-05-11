import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Row, Col, Card, InputGroup, Form, Button} from 'react-bootstrap'
import { BsCart4 } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import {app} from '../../firebaselnit'
import { getDatabase, ref, set, get } from 'firebase/database'

const Books = () => {
  const db = getDatabase(app);
  const navi = useNavigate();
  const uid=sessionStorage.getItem('uid');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('자바');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const callAPI = async() => {
    setLoading(true);
    const url=`https://dapi.kakao.com/v3/search/book?target=title&query=${query}&size=12&page=${page}`;
    const config={
      headers:{"Authorization":"KakaoAK b3a7ddbd52b9bf9a2640d18444cdd3da"}
    };
    const res=await axios.get(url, config);
    console.log(res.data);
    setBooks(res.data.documents);
    setLoading(false);
  }

  useEffect(()=>{
    callAPI();
  }, [page]);

  const onSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    callAPI();
  }

  const onClickCart = (book) => {
    if(uid){
      if(window.confirm(`${book.title}도서를 장바구니에 넣겠습니까?`)){
        get(ref(db, `cart/${uid}/${book.isbn}`)).then(snapshot=>{
          if(snapshot.exists()){
            alert("이미 장바구니에 있습니다!");
          }else{
            set(ref(db, `cart/${uid}/${book.isbn}`), {...book});
            alert("성공하였습니다!");
          }
        });
      }
    }else{
      sessionStorage.setItem('target', '/books');
      navi('/login');
    }
  }

  if(loading) return <h1 className='my-5'>로딩중입니다...</h1>
  return (
    <div>
      <h1 className='my-5'>도서검색</h1>
      <Row className='mb-2'>
        <Col xs={8} md={6} lg={4}>
          <form onSubmit={onSubmit}>
            <InputGroup>
              <Form.Control onChange={(e)=>setQuery(e.target.value)} 
                placeholder='검색어' value={query}/>
              <Button type="submit">검색</Button>
            </InputGroup>
          </form>
        </Col>
      </Row>
      <Row>
        {books.map(book=>
          <Col key={book.isbn} xs={6} md={3} lg={2} className='mb-2'>
            <Card>
              <Card.Body>
               <img width="90%"
                    src={book.thumbnail || 'http://via.placeholder.com/120x170'} />
              </Card.Body>
              <Card.Footer>
                <div className='ellipsis'>{book.title}</div>
                <BsCart4 onClick={()=>onClickCart(book)} 
                    style={{cursor:'pointer', fontSize:'20px', color:'green'}}/>
              </Card.Footer>
            </Card>
          </Col>
        )}
      </Row>
      <div className='text-center my-3'>
        <Button onClick={()=>setPage(page-1)} disabled={page===1}>이전</Button>
        <span className='mx-2'>{page}</span>
        <Button onClick={()=>setPage(page+1)}>다음</Button>
      </div>
    </div>
  )
}

export default Books
