import '../dotenv.js'
import { db } from '../connect.js'
import { selectCardToClone } from '../db/cardQueries.js'
import { copyQuery1 } from '../db/cardQueries.js'
import { copyQuery2 } from '../db/cardQueries.js'
import { cardCloneQuery } from '../db/cardQueries.js'

import { logger } from '../winston/logger.js'

export const cloneCard = async (req, res) => {
  /* 가져오려는 카드 */
  const cardId = req.body.cardId
  console.log('cardId :', cardId)
  /* 로그인 유저 */
  const { user } = res.locals
  const userId = user.user_id

  try {
    await cloneCards(userId, cardId) // userId ='me'
    logger.info('/routes/social/cloneCard 폴더 cloneCard함수, post 성공 !')
    res.status(200).send('SUCCESS')
  } catch (err) {
    logger.error(
      '/routes/social/cloneCard 폴더 cloneCard함수, post, err : ',
      err
    )
    res.status(500).send('Internal Server Error') // Send error response
  }
}

/* user_id만 다른, 동일한 File row 생성 */
const cloneCards = async (userId, cardId) => {
  logger.info('/routes/social/cloneCard 폴더 cloneCards함수, getCardToClone')
  let connection = null
  try {
    connection = await db.getConnection()
    const [selectResults] = await connection.query(selectCardToClone, [cardId])
    let newFileId = -1
    for (let i = 0; i < selectResults.length; i++) {
      logger.info(
        `/routes/social/cloneCard 폴더 cloneCards함수, selectResult : ${selectResults[i]}`
      )
      const tagId = selectResults[i].tagId
      const [copyResult1] = await connection.query(copyQuery1, [userId, cardId])
      if (i == 0) {
        newFileId = copyResult1.insertId
      }

      logger.info(
        `/routes/social/cloneCard 폴더 cloneCards함수, copyResult1 : ${copyResult1}`
      )
      const copyResult2 = await connection.query(cardCloneQuery, [
        newFileId,
        tagId,
      ])
      logger.info(
        `/routes/social/cloneCard 폴더 cloneCards함수, copyResult2 : ${copyResult2}`
      )
    }

    logger.info(
      `/routes/social/cloneCard 폴더 cloneCards함수, newFileId : ${newFileId.fileId}`
    )

    logger.info(
      `/routes/social/cloneCard 폴더 cloneCards함수, Copying card ${cardId} to user ${userId} successed!`
    )

    connection.release()
  } catch (err) {
    connection?.release()
    logger.error(
      '/routes/social/cloneCard 폴더 cloneCards함수, post, err : ',
      err
    )
    throw new Error('Internal Server Error') // Send error response
  }
}
