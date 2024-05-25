import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap'
import { app } from '../../firebaselnit'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import ModalAddress from '../user/ModalAddress'
import ModalPhoto from './ModalPhoto'

const Mypage = () => {
    const db=getFirestore(app);
    const uid=sessionStorage.getItem('uid');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email:sessionStorage.getItem('email'),
        name: '무기명',
        phone: '010-1010-1010',
        address1:'인천 서구 경서동',
        address2:'101동'
    });

    const {name, phone, address1, address2} = form;

    const onChangeForm = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    const callAPI = async() => {
        setLoading(true);
        const res=await getDoc(doc(db, `users/${uid}`));
        if(res.data()){
            setForm(res.data());
        }
        setLoading(false);
    }

    useEffect(()=>{
        callAPI();
    }, []);

    const onSubmit = async(e) => {
        e.preventDefault();
        if(name ===""){
            alert("이름을 입력하세요!");
            return;
        }
        if(!window.confirm('변경된 내용을 저장하실래요?')) return;
        console.log(form);
        setLoading(true);
        await setDoc(doc(db, `users/${uid}`), form);
        setLoading(false);
    }

    if(loading) return <h1 className='text-center my-5'>로딩중...</h1>
    return (
        <Row className='justify-content-center my-5'>
            <Col xs={12} md={10} lg={8}>
                <Card>
                    <Card.Header>
                        <h3 className='text-center'>마이페이지</h3>
                    </Card.Header>
                    <Card.Body>
                        <div>
                            <ModalPhoto form={form} setForm={setForm} setLoading={setLoading}/>
                        </div>
                        <form onSubmit={onSubmit}>
                            <InputGroup className='mb-2'>
                                <InputGroup.Text  style={{width:150}}>이름</InputGroup.Text>
                                <Form.Control name="name" value={name} onChange={onChangeForm}/>
                            </InputGroup>
                            <InputGroup className='mb-2'>
                                <InputGroup.Text style={{width:150}}>전화</InputGroup.Text>
                                <Form.Control name="phone" value={phone} onChange={onChangeForm}/>
                            </InputGroup>
                            <InputGroup className='mb-1'>
                                <InputGroup.Text style={{width:150}}>주소</InputGroup.Text>
                                <Form.Control name="address1" value={address1} onChange={onChangeForm}/>
                                <ModalAddress form={form} setForm={setForm}/>
                            </InputGroup>
                            <div className='mb-3'>
                                <Form.Control name="address2" value={address2} onChange={onChangeForm} placeholder='상세주소'/>
                            </div>
                            <div className='text-center'>
                                <Button className='px-5' type="submit">저장</Button>
                                <Button variant='secondary' className='ms-2 px-5'>취소</Button>
                            </div>
                        </form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default Mypage