(() => {
    // JavaScript 실행 블록 정의
    Entry.block['eval_block'] = {
        color: '#070831',
        skeleton: 'basic',
        params: [{ type: 'Block', accept: 'string', defaultType: 'text' }],
        paramsKeyMap: { CODE: 0 },
        func(sprite, script) {
            const jsCode = script.getStringValue('CODE', script);
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
})();
