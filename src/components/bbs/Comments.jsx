import React, { useEffect, useState } from 'react'
import { Button, Form, Row, Col } from 'react-bootstrap'
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { app } from '../../firebaselnit';
import { addDoc, collection, getFirestore, onSnapshot, orderBy, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const Comments = () => {
    const [comments, setComments] = useState([]);
    const db = getFirestore(app);
    const [contents, setContens] = useState('');
    const email = sessionStorage.getItem('email');
    const { id } = useParams();

    const callAPI = () => {
        const q = query(collection(db, 'comments'), where('pid', '==', id), orderBy('date', 'desc'));
        onSnapshot(q, snapshot => {
            let rows = [];
            snapshot.forEach(row => {
                rows.push({ id: row.id, ...row.data() });
            });
            console.log(rows);
            const data = rows.map(row => row && { ...row, ellip: true, isEdit: false, text:row.contents });
            setComments(data);
        });
    }

    useEffect(() => {
        callAPI();
    }, []);

    const onClickInsert = () => {
        sessionStorage.setItem('target', `/bbs/read/${id}`);
        window.location.href = '/login';
    }

    const onInsert = async () => {
        if (contents == "") {
            alert("댓글 내용을 입력하세요");
            return;
        }
        //댓글등록
        const data = {
            pid: id,
            email,
            contents,
            date: moment(new Date()).format('YYY-MM-DD HH:mm:ss')
        }
        console.log(data);
        await addDoc(collection(db, `/comments`), data);
        alert("댓글등록완료!");
        setContens("");
    }

    const onClickContents = (id) => {
        const data = comments.map(com => com.id === id ? { ...com, ellip: !com.ellip } : com);
        setComments(data);
    }

    const onClickDelete = async (id) => {
        if (!window.confirm(`${id}번 댓글을 삭제하겠습니까?`)) return;
        //댓글삭제
        await deleteDoc(doc(db, `/comments/${id}`));
    }

    const onClickUpdate = (id) => {
        const data = comments.map(com => com.id === id ? { ...com, isEdit: true } : com);
        setComments(data);
    }

    const onChangeContents = (e, id) => {
        const data=comments.map(com=>com.id===id ? {...com, contents:e.target.value} : com);
        setComments(data);
    }

    const onClickCancel = (id) => {
        const data = comments.map(com => com.id===id ? {...com, isEdit:false, contents:com.text} : com);
        setComments(data);
    }

    const onClickSave = async(com) => {
        if(!window.confirm('변경된 내용을 저장하시겠습니까?')) return;
        //변경내용저장
        await updateDoc(doc(db, `/comments/${com.id}`), com);
        callAPI();
    }

    return (
        <div className='my-5'>
            {!email ?
                <div className='text-end'>
                    <Button className='px-5' onClick={onClickInsert}>댓글등록</Button>
                </div>
                :
                <div>
                    <Form.Control value={contents} onChange={(e) => setContens(e.target.value)}
                        as="textarea" rows={5} placeholder='댓글 내용을 입력하세요.' />
                    <div className='text-end mt-2'>
                        <Button onClick={onInsert} className='px-3'>등록</Button>
                    </div>
                </div>
            }
            <div className='my-5'>
                {comments.map(com =>
                    <div key={com.id}>
                        <Row>
                            <Col className='text-muted'>
                                <span className='me-2'>{com.email}</span>
                                <span>{com.date}</span>
                            </Col>
                            {email === com.email && !com.isEdit &&
                                <Col className='text-end mb-2'>
                                    <Button onClick={() => onClickUpdate(com.id)}
                                        size='sm' className='me-2' variant='outline-warning'>수정</Button>
                                    <Button onClick={() => onClickDelete(com.id)}
                                        size='sm' variant='danger'>삭제</Button>
                                </Col>
                            }
                            {email === com.email && com.isEdit &&
                                <Col className='text-end mb-2'>
                                    <Button onClick={() => onClickSave(com)}
                                        size='sm' className='me-2' variant='success'>저장</Button>
                                    <Button onClick={() => onClickCancel(com.id)}
                                        size='sm' variant='secondary'>취소</Button>
                                </Col>
                            }
                        </Row>
                        {com.isEdit ?
                            <Form.Control onChange={(e)=>onChangeContents(e, com.id)}
                                value={com.contents} as="textarea" rows={5} />
                            :
                            <div onClick={() => onClickContents(com.id)}
                                style={{ whiteSpace: 'pre-wrap', cursor: 'pointer' }}
                                className={com.ellip && 'ellipsis'}>{com.contents}</div>
                        }
                        <hr />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Comments
