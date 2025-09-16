(() => {
    // JavaScript 실행 블록 정의
    Entry.block['eval_block'] = {
        color: '#39C5BB',
        skeleton: 'basic',
        params: [{ type: 'Block', accept: 'string', defaultType: 'text' }],
        paramsKeyMap: { CODE: 0 },
        func(sprite, script) {
            const jsCode = script.getStringValue('CODE', script);
            return eval(jsCode);
        }
    };
    
    // JS 실행 블록 (결괏값 반환용)
    Entry.block['eval_value'] = {
        skeleton: 'basic_string_field',
        color: '#DC143C',
        params: [{ type: 'Block', accept: 'string', defaultType: 'text' }],
        paramsKeyMap: { CODE: 0 },
        func(sprite, script) {
            const jsCode = script.getStringValue('CODE', script);
            const p = script.executor.register?.params || [];
            return eval(jsCode);
        }
    };
    
    // @test@ 함수 찾아서 JavaScript 알람으로 교체
    Object.values(Entry.variableContainer.functions_).forEach(func => {
        if (func.block?.template?.includes('@test@')) {
            const newBlocks = [
                [
                    { type: func.type === 'value' ? 'function_create_value' : 'function_create', x: 40, y: 40 },
                    { type: 'eval_block', params: [`alert("알람 실행");`] }
                ]
            ];
            func.content.load(newBlocks);
            Entry.variableContainer.saveFunction(func);
        }
    });
    
    // @log 함수 찾아서 log 계산으로 교체
    Object.values(Entry.variableContainer.functions_).forEach(func => {
        if (func.block?.template === ' @log %1 ( %2 )@' && func.type === 'value') {
            func.content.load([
                [{
                    type: 'function_create_value',
                    x: 40, y: 40,
                    params: [
                        func.content.getThreads()[0]?.getFirstBlock()?.params[0],
                        null, null,
                        {
                            type: 'eval_value',
                            params: ['Math.log(p[1] || 1) / Math.log(p[0] || 10)']
                        }
                    ],
                    statements: [[]]
                }]
            ]);
            Entry.variableContainer.saveFunction(func);
        }
    });
})();
