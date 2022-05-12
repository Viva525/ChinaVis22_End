
// 节点搜索解析中间件
module.exports = () =>{
	return  async function paramsConvert(ctx, next) {
		const params:any = {};
		const body = ctx.request.body.searchParams;
		const node = body.split(/[?,>,:,\,]/g);
		if(body.includes('>')){
			params.type = 'link';
		}else if(body.includes('?')){
			params.type = 'condition';
		}else{
			params.type = 'node';
		}
		console.log(node);
		params.node = node;
		ctx.request.body = params;
		await next();
	}
}