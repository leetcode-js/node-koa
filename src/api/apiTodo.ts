import router from './main';
import query from '../modules/mysql';
import stateInfo from '../modules/state';
import { mysqlQueryType, mysqlErrorType, sessionResultType } from '../modules/interfaces';

// 获取所有列表
router.get('/getList', async (ctx) => {
    const state: sessionResultType = ctx['the_state'];
    /** 返回结果 */
    let bodyResult = null;
    
    // console.log('getList');

    // 这里要开始连表查询
    await query(`select * from user_list where user_id = '${ state.info.id }'`).then((res: mysqlQueryType) => {
        // console.log('/getList 查询', res.results);
        bodyResult = stateInfo.getSuccessData({
            list: res.results.length > 0 ? res.results : [] 
        });
    }).catch((err: mysqlErrorType) => {
        bodyResult = stateInfo.getFailData(err.message);
    })

    ctx.body = bodyResult;
})

// 添加列表
router.post('/addList', async (ctx) => {
    const state: sessionResultType = ctx['the_state'];
    /** 接收参数 */
    const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult = null;

    if (!params.content) {
        return ctx.body = stateInfo.getFailData('添加的列表内容不能为空！');
    }

    // 写入列表
    await query('insert into user_list(list_text, list_time, user_id) values(?,?,?)', [params.content, new Date().toLocaleDateString(), state.info.id]).then((res: mysqlQueryType) => {
        console.log('写入列表', res);
        bodyResult = stateInfo.getSuccessData({
            id: res.results.insertId
        }, '添加成功');
    }).catch((err: mysqlErrorType) => {
        console.log('写入列表错误', err);
        bodyResult = stateInfo.getFailData(err.message);
    })
    
    ctx.body = bodyResult;
})

// 修改列表
router.post('/modifyList', async (ctx) => {
    /** 接收参数 */
    const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult = null;

    if (!params.id) {
        return ctx.body = stateInfo.getFailData('列表id不能为空');
    }

    if (!params.content) {
        return ctx.body = stateInfo.getFailData('列表内容不能为空');
    }

    // 修改列表
    await query(`update user_list set list_text='${params.content}', list_time='${new Date().toLocaleDateString()}' where list_id='${params.id}'`).then((res: mysqlQueryType) => {
        console.log('修改列表', res);
        if (res.results.affectedRows > 0) {
            bodyResult = stateInfo.getSuccessData({}, '修改成功');
        } else {
            bodyResult = stateInfo.getFailData('列表id不存在');
        }
    }).catch((err: mysqlErrorType) => {
        console.log('修改列表错误', err);
        bodyResult = stateInfo.getFailData(err.message);
    })

    ctx.body = bodyResult;
})

// 删除列表
router.post('/deleteList', async (ctx) => {
    const state: sessionResultType = ctx['the_state'];
    /** 接收参数 */
    const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult = null;

    // 从数据库中删除
    await query(`delete from user_list where list_id=${params.id} and user_id = ${state.info.id}`).then((res: mysqlQueryType) => {
        console.log('从数据库中删除', res);
        if (res.results.affectedRows > 0) {
            bodyResult = stateInfo.getSuccessData({}, '删除成功');
        } else {
            bodyResult = stateInfo.getFailData('当前列表id不存在或已删除');
        }
    }).catch((err: mysqlErrorType) => {
        console.log('从数据库中删除失败', err);
        bodyResult = stateInfo.getFailData(err.message);
    })

    ctx.body = bodyResult;
})