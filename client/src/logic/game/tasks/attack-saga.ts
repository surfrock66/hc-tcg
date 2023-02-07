import {select} from 'typed-redux-saga'
import {call, put} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {CardT} from 'types/game-state'
import {CardInfoT, EffectCardT} from 'types/cards'
import CARDS from 'server/cards'
import DAMAGE from 'server/const/damage'
import {runPickProcessSaga} from './pick-process-saga'
import {getPlayerState} from 'logic/game/game-selectors'
// TODO - get rid of app game-selectors
import {getPlayerActiveRow} from '../../../app/game/game-selectors'
import {attack} from '../game-actions'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

type AttackAction = {
	type: 'ATTACK'
	payload: {
		type: 'zero' | 'primary' | 'secondary'
	}
}

export function* attackSaga(action: AttackAction): SagaIterator {
	const {type} = action.payload
	const playerState = yield* select(getPlayerState)
	const activeRow = yield* select(getPlayerActiveRow)
	if (!playerState || !activeRow || !activeRow.hermitCard) return

	const singleUseCard = playerState.board.singleUseCard
	const hermitCard = activeRow.hermitCard
	const singleUseInfo = singleUseCard
		? (TYPED_CARDS[singleUseCard.cardId] as EffectCardT)
		: null
	const damageInfo = singleUseInfo && DAMAGE[singleUseInfo.id]

	const result = {} as Record<string, Array<CardT>>
	if (singleUseInfo && damageInfo?.afkTarget) {
		result[singleUseInfo.id] = yield call(runPickProcessSaga, singleUseInfo.id)
		if (!result[singleUseInfo.id]) return
	}

	const cardId = hermitCard.cardId
	if (
		['hypnotizd_rare', 'keralis_rare'].includes(cardId) &&
		type === 'secondary'
	) {
		result[cardId] = yield call(runPickProcessSaga, cardId)
		if (!result[cardId]) return
	}

	yield put(attack(type, result))
}

export default attackSaga
