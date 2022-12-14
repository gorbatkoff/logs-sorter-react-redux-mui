import React, { useState } from 'react'
import DataOutput from './DataOutput.jsx/DataOutput';

import { TextField, Select, Button, MenuItem, InputLabel, Box, FormControl, Container } from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import styles from './Search.module.css';

import { api } from './../../config/index';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import axios from 'axios';
import FileSaver from "file-saver";

function Search() {

    const [data, setData] = useState();
    const [logs, setLogs] = useState();
    const [logsFile, setLogsFile] = useState();

    const [typeOfSearch, setTypeOfSearch] = useState('');
    const { register, handleSubmit, formState: { errors } } = useForm();

    const dispatch = useDispatch();
    const countOfItems = useSelector(state => state.itemsCount);


    async function getSites(data) {
        try {
            const request = await api.get(`Site/GetSites?Search=${data.search}`);

            dispatch({ type: "CHANGE_COUNT_OF_ITEMS", payload: request.data.paginationSites.totalItems });

            console.log(countOfItems)

            console.log(request.data.paginationSites.items);
            setData(request.data.paginationSites.items);

        } catch (error) {
            console.log(error);
        }
    }

    async function getEmails(data) {
        try {
            const request = await api.get(`Email/GetEmails?Search=${data.search}`);

            console.log(request.data.paginationEmails.items);
            setData(request.data.paginationEmails.items);

        } catch (error) {
            console.log(error);
        }
    }

    async function getUserDatas(data) {
        try {
            const request = await api.get(`Userdata/GetUserdatas?Search=${data.search}`);

            console.log(request.data.paginationUserdatas.items);
            setData(request.data.paginationUserdatas.items);

        } catch (error) {
            console.log(error);
        }
    }

    async function getLogs(data) {
        try {
            axios({
                url: `http://91.220.69.117:5000/api/Userdata/GetArchiveUserdatasBySiteId?SiteId=${data['search-logs-by-id']}&Count=${data.count}`,
                method: 'GET',
                responseType: 'blob', // important
              }).then((response) => {
                 const url = window.URL.createObjectURL(new Blob([response.data]));
                 const link = document.createElement('a');
                 link.href = url;
                 let nameOfFile = data['name-of-file'] || 'Logs';
                 nameOfFile = nameOfFile + '.zip'; 
                 link.setAttribute('download', nameOfFile); //or any other extension
                 document.body.appendChild(link);
                 link.click();
              });

        } catch (error) {
            console.log(error);
        }
    }

    async function onSubmit(data, typeOfSearch) {

        switch (data.type) {
            case 'Emails':
                return getEmails(data);
            case 'Sites':
                return getSites(data);
            case 'UserDatas':
                return getUserDatas(data);
            default:
                return null;
        }

    }

    async function outputLogins(data) {

        const id = data['search-by-id'];

        try {
            axios({
                url: `http://91.220.69.117:5000/api/Userdata/GetFileUserdatasBySiteId?SiteId=${id}`,
                method: 'GET',
                responseType: 'blob', // important
              }).then((response) => {
                 const url = window.URL.createObjectURL(new Blob([response.data]));
                 const link = document.createElement('a');
                 link.href = url;
                 link.setAttribute('download', 'Logs.txt'); //or any other extension
                 document.body.appendChild(link);
                 link.click();
              });

        } catch (error) {
            console.log(error);
        }

    }

    function createBlob() {

        var blob = new Blob(logs, {
            type: "text/plain;charset=utf-8"
        });

        FileSaver.saveAs(blob, `Logs.txt`);
    }

    function createBlobForLogs() {

        let blob = new Blob([logsFile], { type: 'application/zip' })
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          document.body.appendChild(link);
          link.click()
          document.body.removeChild(link);
    }

    const handleChangeType = (event) => {
        setTypeOfSearch(event.target.value);
        setData();
    };

    return (
        <div style={{ paddingTop: "3em" }}>

            <h3>?????????? ???? ??????????</h3>
            
            
            <form className={styles.search} onSubmit={handleSubmit(onSubmit)}>
                <TextField {...register("search")} id="outlined-basic" label="?????? ?????????? ?????????????" variant="outlined"
                    sx={{ width: '50%', }} placeholder="Id / Text search" />

                <Box sx={{ width: '25%', }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">?????? ?????????????</InputLabel>
                        <Select
                            {...register("type")}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={typeOfSearch}
                            label="?????? ????????????"
                            onChange={handleChangeType}
                        >
                            <MenuItem value={"Sites"}>???? ????????????</MenuItem>
                            <MenuItem value={"Emails"}>???? ????????????</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Button type="submit" variant="contained" size="large"
                    sx={{
                        background: "linear-gradient(90deg,#833AB4 0%,#FD1D1D 50%,#FCB045 100%)",
                        color: "#fff"
                    }}
                >??????????</Button >
            </form> 

            {
                data
                    ?
                    <DataOutput data={data} type={typeOfSearch} />
                    :
                    <Container>
                        <h4 align="center">?????????????? ???????????? ??????????????</h4>
                    </Container>
            }

            <h3>?????????? ???? ???????????????? ?? ??????????????</h3>

            <form className={styles['second-search']} onSubmit={handleSubmit(outputLogins)}>
                <TextField {...register("search-by-id")} id="outlined-basic" label="?????????????? Id" variant="outlined"
                    sx={{ width: '30%' }} placeholder="353" />


                <Button type="submit" variant="contained" size="large"
                    sx={{
                        background: "linear-gradient(90deg,#833AB4 0%,#FD1D1D 50%,#FCB045 100%)",
                        color: "#fff"
                    }}
                >???????????????? ????????????:????????????</Button >

                {logs
                    ?
                    <Button variant="contained" size="large"
                        sx={{ background: "red", textTransform: 'none', background: 'linear-gradient(90deg,#833AB4 0%,#FD1D1D 50%,#FCB045 100%)' }}
                        endIcon={<CloudDownloadIcon />} onClick={createBlob}>
                        ?????????????? ????????????:????????????
                    </Button>
                    :
                    <></>
                }
            </form>

            <h3>?????????? ???? ??????????</h3>

            <form className={styles['second-search']} onSubmit={handleSubmit(getLogs)}>
                <TextField {...register("search-logs-by-id")} id="outlined-basic" label="?????????????? Id" variant="outlined"
                    sx={{ width: '20%' }} placeholder="353" />

                <TextField {...register("count")} id="outlined-basic" label="?????????????? ????????????????????" variant="outlined"
                    sx={{ width: '30%' }} placeholder="353" />

                <TextField {...register("name-of-file")} id="outlined-basic" label="?????? ?????????? (??????????????????????????)" variant="outlined"
                    sx={{ width: '30%' }} placeholder="Azure, Amazon, Microsoft ..." />

                <Button type="submit" variant="contained" size="large"
                    sx={{
                        background: "linear-gradient(90deg,#833AB4 0%,#FD1D1D 50%,#FCB045 100%)",
                        color: "#fff"
                    }}
                >???????????????? ????????</Button >

                {logsFile
                    ?
                    <Button variant="contained" size="large"
                        sx={{ background: "red", textTransform: 'none', background: 'linear-gradient(90deg,#833AB4 0%,#FD1D1D 50%,#FCB045 100%)' }}
                        endIcon={<CloudDownloadIcon />} onClick={createBlobForLogs}>
                        ?????????????? ????????
                    </Button>
                    :
                    <></>
                }

            </form>

            <div style={{margin: "100px"}}>

            </div>

        </div>
    )
}

export default Search